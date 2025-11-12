import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  onMessageListener,
  saveFCMTokenToBackend,
  deleteFCMTokenFromBackend,
} from "../services/firebase/firebaseConfig";
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeFCM = async () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
          setIsInitialized(true);
          return;
        }

        const user = JSON.parse(userStr);

        if (!user.id && !user.id_user) {
          setIsInitialized(true);
          return;
        }

        const userId = user.id || user.id_user;

        if (!("Notification" in window)) {
          setIsInitialized(true);
          return;
        }

        if (Notification.permission === "granted") {
          const simpleToken = `web_${userId}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}`;

          setFcmToken(simpleToken);

          const success = await saveFCMTokenToBackend(simpleToken, userId);

          if (success) {
            localStorage.setItem("fcmToken", simpleToken);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing FCM:", error);
        setIsInitialized(true);
      }
    };

    initializeFCM();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    onMessageListener((payload) => {
      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body || "";

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-neutral-900 border border-neutral-700 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="flex items-center justify-center rounded-full size-10 bg-orange-500/20">
                    <svg
                      className="text-orange-400 size-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm font-medium text-neutral-100">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">{body}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-neutral-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex items-center justify-center w-full p-4 text-sm font-medium border border-transparent rounded-none rounded-r-lg text-neutral-400 hover:text-neutral-300 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
        }
      );
    });
  }, [isInitialized]);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationPermission("granted");

        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userId = user.id || user.id_user;

          if (userId) {
            const simpleToken = `web_${userId}_${Date.now()}_${Math.random()
              .toString(36)
              .substring(7)}`;

            setFcmToken(simpleToken);

            const success = await saveFCMTokenToBackend(simpleToken, userId);

            if (success) {
              localStorage.setItem("fcmToken", simpleToken);
              toast.success("Notifikasi berhasil diaktifkan!");
              return true;
            } else {
              toast.error("Gagal menyimpan token ke server");
              return false;
            }
          }
        }

        toast.error("User tidak ditemukan");
        return false;
      } else {
        toast.error(
          permission === "denied"
            ? "Notifikasi ditolak"
            : "Gagal mengaktifkan notifikasi"
        );
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Gagal mengaktifkan notifikasi");
      return false;
    }
  };

  const clearFCMToken = async () => {
    try {
      const savedToken = localStorage.getItem("fcmToken");

      if (savedToken) {
        await deleteFCMTokenFromBackend(savedToken);
      }

      localStorage.removeItem("fcmToken");
      setFcmToken(null);
    } catch (error) {
      console.error("Error clearing FCM token:", error);
    }
  };

  const value = {
    fcmToken,
    notificationPermission,
    isInitialized,
    requestPermission,
    clearFCMToken,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
