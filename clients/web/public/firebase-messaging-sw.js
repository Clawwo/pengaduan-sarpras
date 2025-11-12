/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Initialize Firebase in Service Worker
// Note: Config akan di-inject saat build atau diambil dari cache
firebase.initializeApp({
  apiKey: "AIzaSyAYwrrFJoy6FIsriJhv1ESskmciX8Hrpkk",
  authDomain: "pushnotification---ukk.firebaseapp.com",
  projectId: "pushnotification---ukk",
  storageBucket: "pushnotification---ukk.firebasestorage.app",
  messagingSenderId: "500657824677",
  appId: "1:500657824677:web:5c5c86b343926e710bbe4c",
  measurementId: "G-V5KP0T3DBC",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.icon || "/logo.png",
    badge: "/logo.png",
    tag: payload.notification?.tag || "default",
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received:", event);

  event.notification.close();

  // Get the URL from notification data or use default
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
