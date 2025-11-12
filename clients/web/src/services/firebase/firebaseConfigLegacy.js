// Legacy Firebase Configuration untuk FCM
// Gunakan ini jika FCM API v1 tidak bisa diaktifkan

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;

try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized (Legacy mode)");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

export { app };

/**
 * Request permission dan dapatkan token menggunakan manual registration
 */
export const requestNotificationPermissionLegacy = async () => {
  try {
    if (!("Notification" in window)) {
      console.log("❌ Browser tidak mendukung notifikasi");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.log("❌ Service Worker tidak didukung");
      return null;
    }

    console.log("📱 Requesting notification permission (Legacy mode)...");

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("✅ Permission granted");

      // Register service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      await navigator.serviceWorker.ready;
      console.log("✅ Service Worker ready");

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_FIREBASE_VAPID_KEY
        ),
      });

      console.log("✅ Push subscription created");

      // Convert subscription to FCM token format
      const token = btoa(JSON.stringify(subscription));
      console.log("✅ Token created (legacy):", token.substring(0, 50) + "...");

      return token;
    } else {
      console.log("❌ Permission denied");
      return null;
    }
  } catch (error) {
    console.error("❌ Error in legacy notification setup:", error);
    return null;
  }
};

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Save token to backend (same as before)
 */
export const saveFCMTokenToBackend = async (token, userId) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      console.error("No auth token found");
      return false;
    }

    const deviceInfo = {
      browser: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString(),
      mode: "legacy",
    };

    console.log("🚀 Sending FCM token to backend (legacy):", {
      apiUrl,
      userId,
      tokenPreview: token.substring(0, 50) + "...",
    });

    const response = await fetch(`${apiUrl}/api/notifications/register-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fcmToken: token,
        deviceInfo: deviceInfo,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ FCM token berhasil disimpan ke backend:", data);
      return true;
    } else {
      console.error("❌ Gagal menyimpan FCM token ke backend:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Error menyimpan FCM token:", error);
    return false;
  }
};

export const deleteFCMTokenFromBackend = async (token) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const authToken = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/api/notifications/delete-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fcmToken: token,
      }),
    });

    if (response.ok) {
      console.log("FCM token berhasil dihapus dari backend");
      return true;
    } else {
      console.error("Gagal menghapus FCM token dari backend");
      return false;
    }
  } catch (error) {
    console.error("Error menghapus FCM token:", error);
    return false;
  }
};
