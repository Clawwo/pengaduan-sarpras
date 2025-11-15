import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, X, Clock } from "lucide-react";
import axios from "axios";
import { useAppConfig } from "../lib/useAppConfig";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { apiUrl } = useAppConfig();
  const dropdownRef = useRef(null);
  const previousNotificationIds = useRef(new Set());

  useEffect(() => {
    const requestPermission = async () => {
      if (!("Notification" in window)) return;

      if (Notification.permission === "granted") {
        setPermissionGranted(true);
      } else if (Notification.permission !== "denied") {
        try {
          const permission = await Notification.requestPermission();
          setPermissionGranted(permission === "granted");

          if (permission === "granted") {
            new Notification("Notifikasi Aktif! 🎉", {
              body: "Kamu akan menerima notifikasi desktop dari sekarang",
              icon: "/favicon.ico",
            });
          }
        } catch (err) {
          console.error("Error requesting permission:", err);
        }
      }
    };

    requestPermission();
  }, []);

  const showDesktopNotification = (notification) => {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        setPermissionGranted(permission === "granted");
      });
      return;
    }

    try {
      const options = {
        body: notification.body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
      };

      const desktopNotif = new Notification(notification.title, options);

      desktopNotif.onclick = () => {
        window.focus();
        markAsRead(notification.id);

        if (notification.data?.url) {
          window.location.href = notification.data.url;
        }

        desktopNotif.close();
      };

      setTimeout(() => {
        desktopNotif.close();
      }, 10000);
    } catch (error) {
      console.error("Error showing desktop notification:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/notifications/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newNotifications = response.data.notifications || [];
      const newCount = response.data.count || 0;

      newNotifications.forEach((notification) => {
        if (!previousNotificationIds.current.has(notification.id)) {
          showDesktopNotification(notification);
          previousNotificationIds.current.add(notification.id);
        }
      });

      setNotifications(newNotifications);
      setUnreadCount(newCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      fetchNotifications();
    }, 500);

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, permissionGranted]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${apiUrl}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      previousNotificationIds.current.delete(notificationId);

      // Remove from list immediately for better UX
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Still remove from UI even if API call fails (maybe already marked)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `${apiUrl}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      previousNotificationIds.current.clear();

      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking all as read:", error);
      // Force clear UI even if API fails
      previousNotificationIds.current.clear();
      setNotifications([]);
      setUnreadCount(0);
      
      // Refetch to sync with server
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  // Get icon & color based on notification type and role
  const getNotificationIcon = (notification) => {
    const { type, role_target, status } = notification.data || {};
    
    // For status updates (pengguna)
    if (type === "status_update") {
      if (status === "Selesai") return { icon: "✅", color: "text-green-400" };
      if (status === "Diproses") return { icon: "🔄", color: "text-blue-400" };
      if (status === "Ditinjau") return { icon: "👁️", color: "text-purple-400" };
      if (status === "Ditolak") return { icon: "❌", color: "text-red-400" };
      return { icon: "📋", color: "text-neutral-400" };
    }
    
    // For new pengaduan (admin & petugas)
    if (type === "new_pengaduan") {
      if (role_target === "admin") return { icon: "📋", color: "text-blue-400" };
      if (role_target === "petugas") return { icon: "🔧", color: "text-orange-400" };
    }
    
    // Default
    return { icon: "🔔", color: "text-neutral-400" };
  };

  const getTimeAgo = (sentAt) => {
    const now = new Date();
    const sent = new Date(sentAt);
    const diffInSeconds = Math.floor((now - sent) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}j`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}h`;
    return new Date(sentAt).toLocaleDateString("id-ID", { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-neutral-800 rounded-lg transition-all duration-200"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5 text-neutral-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full font-semibold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-neutral-100">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 disabled:opacity-50 transition-colors"
                title="Tandai semua dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Baca Semua</span>
              </button>
            )}
          </div>

          {/* Notification Permission Banner - Minimalis */}
          {!permissionGranted &&
            "Notification" in window &&
            Notification.permission !== "denied" && (
              <div className="px-4 py-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-500/20">
                <div className="flex items-start gap-3">
                  <Bell className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-orange-200 mb-1.5 font-medium">
                      Aktifkan Notifikasi Desktop
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          const permission = await Notification.requestPermission();
                          setPermissionGranted(permission === "granted");
                          if (permission === "granted") {
                            new Notification("Notifikasi Aktif! 🎉", {
                              body: "Kamu akan menerima pemberitahuan real-time",
                              icon: "/favicon.ico",
                            });
                          }
                        } catch (err) {
                          console.error("Error requesting permission:", err);
                        }
                      }}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md transition-colors font-medium"
                    >
                      Aktifkan Sekarang
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Blocked Permission - Minimalis */}
          {Notification.permission === "denied" && (
            <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-xs">
                  <p className="text-red-200 font-medium mb-1">
                    Notifikasi Diblokir
                  </p>
                  <p className="text-red-300/80">
                    Aktifkan di pengaturan browser
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
                  <Bell className="w-7 h-7 text-neutral-600" />
                </div>
                <p className="text-sm text-neutral-400 font-medium mb-1">
                  Tidak Ada Notifikasi
                </p>
                <p className="text-xs text-neutral-500">
                  Kamu akan menerima pemberitahuan di sini
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => {
                  const { icon, color } = getNotificationIcon(notification);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="group px-4 py-3 hover:bg-neutral-800/60 cursor-pointer transition-all duration-150 border-b border-neutral-800/50 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <span className={`text-xl ${color}`}>{icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-100 mb-1 line-clamp-1 group-hover:text-white transition-colors">
                            {notification.title}
                          </p>
                          <p className="text-xs text-neutral-400 line-clamp-2 mb-2 leading-relaxed">
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(notification.sent_at)}</span>
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
