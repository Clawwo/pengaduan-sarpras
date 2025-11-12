import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

const NotificationPermission = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ("Notification" in window) {
      // Show banner if permission is default (not yet asked)
      if (Notification.permission === "default") {
        // Wait 2 seconds before showing to avoid overwhelming user
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Show a test notification
        new Notification("Notifikasi Diaktifkan! 🎉", {
          body: "Kamu akan menerima notifikasi untuk update pengaduan",
          icon: "/favicon.ico",
        });
      }
      setShowBanner(false);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal in localStorage to not show again for this session
    localStorage.setItem("notificationBannerDismissed", "true");
  };

  // Don't show if already dismissed in this session
  if (localStorage.getItem("notificationBannerDismissed")) {
    return null;
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-2xl border border-orange-400 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm mb-1">
              Aktifkan Notifikasi Desktop
            </h3>
            <p className="text-white/90 text-xs mb-3">
              Dapatkan update real-time tentang status pengaduan kamu langsung di desktop
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-1.5 bg-white text-orange-600 text-xs font-medium rounded-md hover:bg-orange-50 transition-colors"
              >
                Aktifkan
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 bg-white/10 text-white text-xs font-medium rounded-md hover:bg-white/20 transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission;
