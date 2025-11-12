import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
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

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
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

  const getTimeAgo = (sentAt) => {
    const now = new Date();
    const sent = new Date(sentAt);
    const diffInSeconds = Math.floor((now - sent) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-neutral-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-neutral-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-100">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isLoading}
                className="text-xs text-orange-400 hover:text-orange-300 disabled:opacity-50"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {!permissionGranted &&
            "Notification" in window &&
            Notification.permission !== "denied" && (
              <div className="p-3 bg-orange-500/10 border-b border-orange-500/20">
                <p className="text-xs text-orange-300 mb-2">
                  Aktifkan notifikasi desktop untuk mendapatkan pemberitahuan
                  real-time
                </p>
                <button
                  onClick={async () => {
                    try {
                      const permission = await Notification.requestPermission();
                      setPermissionGranted(permission === "granted");
                      if (permission === "granted") {
                        new Notification("Notifikasi Diaktifkan! 🎉", {
                          body: "Sekarang kamu akan menerima notifikasi desktop dari aplikasi ini",
                          icon: "/favicon.ico",
                        });
                      }
                    } catch (err) {
                      console.error("Error requesting permission:", err);
                      alert(
                        "Gagal meminta izin notifikasi. Coba refresh halaman atau check browser settings."
                      );
                    }
                  }}
                  className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
                >
                  Aktifkan Notifikasi Desktop
                </button>
              </div>
            )}

          {Notification.permission === "denied" && (
            <div className="p-3 bg-red-500/10 border-b border-red-500/20">
              <p className="text-xs text-red-300 mb-1 font-semibold">
                ⚠️ Notifikasi Diblokir
              </p>
              <p className="text-xs text-red-200 mb-2">
                Untuk Chrome: Klik icon 🔒 di address bar → Site settings →
                Notifications → Allow
              </p>
              <button
                onClick={() => {
                  window.open(
                    "chrome://settings/content/notifications",
                    "_blank"
                  );
                }}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Buka Chrome Settings
              </button>
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada notifikasi baru</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-100 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-neutral-400 line-clamp-2 mb-2">
                          {notification.body}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {getTimeAgo(notification.sent_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
