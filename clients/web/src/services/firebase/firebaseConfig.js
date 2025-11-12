import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration dari environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log("🔥 Firebase Config Check:");
console.log("  - API Key:", firebaseConfig.apiKey ? "✅" : "❌");
console.log("  - Project ID:", firebaseConfig.projectId);
console.log("  - Messaging Sender ID:", firebaseConfig.messagingSenderId);
console.log("  - App ID:", firebaseConfig.appId ? "✅" : "❌");

// Initialize Firebase
let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

export { app, messaging };

/**
 * Request permission untuk notifikasi dan dapatkan FCM token
 * @returns {Promise<string|null>} FCM token atau null jika gagal
 */
export const requestNotificationPermission = async () => {
  try {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("❌ Browser tidak mendukung notifikasi");
      return null;
    }

    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      console.log("❌ Service Worker tidak didukung");
      return null;
    }

    // Check if messaging is initialized
    if (!messaging) {
      console.error("❌ Firebase Messaging belum diinisialisasi");
      return null;
    }

    console.log("📱 Step 1: Registering service worker...");

    // Register service worker explicitly
    let registration;
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("✅ Service Worker registered:", registration.scope);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("✅ Service Worker is ready");
    } catch (swError) {
      console.error("❌ Service Worker registration failed:", swError);
      return null;
    }

    console.log("📱 Step 2: Requesting notification permission...");

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("✅ Notification permission granted");

      try {
        console.log("📱 Step 3: Getting FCM token...");

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

        console.log("🔑 VAPID Key info:");
        console.log("  - Length:", vapidKey?.length);
        console.log("  - Preview:", vapidKey?.substring(0, 30) + "...");
        console.log(
          "  - Valid:",
          vapidKey && vapidKey.length >= 80 ? "✅" : "❌"
        );

        let token;

        if (vapidKey && vapidKey.length >= 80) {
          console.log("🔄 Requesting token with VAPID key...");
          token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
          });
        } else {
          console.warn("⚠️ VAPID key tidak valid, mencoba tanpa VAPID key...");
          token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
          });
        }

        if (token) {
          console.log("✅ FCM Token received:", token.substring(0, 50) + "...");
          return token;
        } else {
          console.log("❌ Tidak bisa mendapatkan token (token is empty)");
          return null;
        }
      } catch (error) {
        console.error("❌ Error getting FCM token:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          name: error.name,
        });

        // Specific error handling
        if (error.code === "messaging/token-subscribe-failed") {
          console.error("💡 Solusi:");
          console.error(
            "   1. Pastikan Firebase Cloud Messaging API sudah ENABLED"
          );
          console.error(
            "   2. Buka: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=pushnotification---ukk"
          );
          console.error("   3. Klik ENABLE");
          console.error("   4. Tunggu 2-3 menit");
          console.error("   5. Refresh browser dan coba lagi");
        }

        return null;
      }
    } else if (permission === "denied") {
      console.log("❌ Notification permission ditolak");
      return null;
    } else {
      console.log("⏸️ Notification permission tidak dijawab");
      return null;
    }
  } catch (error) {
    console.error("❌ Error mendapatkan notification permission:", error);
    return null;
  }
};

/**
 * Listen untuk foreground messages
 * @param {Function} callback - Callback function yang akan dipanggil ketika menerima message
 */
export const onMessageListener = (callback) => {
  if (!messaging) {
    console.error("Firebase Messaging belum diinisialisasi");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload);

    // Call callback dengan payload
    if (callback && typeof callback === "function") {
      callback(payload);
    }

    // Show notification jika browser tidak sedang dalam focus
    if (document.hidden && payload.notification) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || "/logo.png",
        badge: "/logo.png",
        tag: payload.notification.tag || "default",
        data: payload.data,
      });
    }
  });
};

/**
 * Save FCM token ke backend
 * @param {string} token - FCM token
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const saveFCMTokenToBackend = async (token, userId) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      console.error("No auth token found");
      return false;
    }

    // Get device info
    const deviceInfo = {
      browser: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString(),
    };

    console.log("🚀 Sending FCM token to backend:", {
      apiUrl,
      userId,
      tokenPreview: token.substring(0, 50) + "...",
      deviceInfo,
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

/**
 * Delete FCM token dari backend (untuk logout)
 * @param {string} token - FCM token
 * @returns {Promise<boolean>} Success status
 */
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
