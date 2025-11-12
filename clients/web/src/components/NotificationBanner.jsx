import React, { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";

const NotificationBanner = () => {
  const { notificationPermission, requestPermission } = useNotification();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed before
    const bannerDismissed = localStorage.getItem("notificationBannerDismissed");

    if (bannerDismissed === "true") {
      setDismissed(true);
      return;
    }

    // Show banner if permission is default (not granted or denied)
    if (notificationPermission === "default") {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notificationPermission]);

  const handleEnable = async () => {
    const success = await requestPermission();
    if (success) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("notificationBannerDismissed", "true");
  };

  if (!showBanner || dismissed || notificationPermission !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="size-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bell className="size-5 text-orange-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-100 mb-1">
              Aktifkan Notifikasi
            </h3>
            <p className="text-sm text-neutral-400 mb-3">
              Dapatkan notifikasi real-time untuk update pengaduan dan aksi
              petugas.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                className="px-3 py-1.5 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Aktifkan
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-sm rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
