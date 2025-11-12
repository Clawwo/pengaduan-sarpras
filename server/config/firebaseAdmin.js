import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
// You need to download service account key from Firebase Console
// Firebase Console > Project Settings > Service Accounts > Generate new private key
let firebaseAdmin;

try {
  // Option 1: Using service account key file (recommended for production)
  // const serviceAccount = require("./path/to/serviceAccountKey.json");
  // firebaseAdmin = admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  // });

  // Option 2: Using environment variables (for development)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn(
      "Firebase Admin SDK not initialized. FCM notifications will not work."
    );
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

/**
 * Send notification to specific FCM token
 * @param {string} token - FCM token
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 * @returns {Promise<string>} Message ID
 */
export const sendNotificationToToken = async (
  token,
  notification,
  data = {}
) => {
  // Check if token is dummy token (for development/testing)
  if (token.startsWith("dummy_") || token.startsWith("web_")) {
    console.log("⚠️ Dummy token detected, logging notification instead:");
    console.log("📧 Notification:", {
      token: token.substring(0, 30) + "...",
      title: notification.title,
      body: notification.body,
      data: data,
    });

    // Simulate successful send
    return `mock-message-id-${Date.now()}`;
  }

  if (!firebaseAdmin) {
    throw new Error("Firebase Admin SDK not initialized");
  }

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
      icon: notification.icon || "/logo.png",
    },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // For mobile
    },
    token: token,
    webpush: {
      notification: {
        icon: notification.icon || "/logo.png",
        badge: "/logo.png",
        tag: notification.tag || "default",
        requireInteraction: false,
      },
      fcmOptions: {
        link: data.url || "/",
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Send notification to multiple FCM tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 * @returns {Promise<Object>} Batch response
 */
export const sendNotificationToMultipleTokens = async (
  tokens,
  notification,
  data = {}
) => {
  // Filter out dummy tokens and real tokens
  const dummyTokens = tokens.filter(
    (t) => t.startsWith("dummy_") || t.startsWith("web_")
  );
  const realTokens = tokens.filter(
    (t) => !t.startsWith("dummy_") && !t.startsWith("web_")
  );

  // Log dummy token notifications
  if (dummyTokens.length > 0) {
    console.log(
      `⚠️ ${dummyTokens.length} dummy tokens detected, logging notification:`
    );
    console.log("📧 Notification:", {
      title: notification.title,
      body: notification.body,
      recipients: dummyTokens.length,
      data: data,
    });
  }

  // If no real tokens, return mock response immediately
  if (realTokens.length === 0) {
    console.log("✅ Notification logged successfully (no real tokens to send)");
    return {
      successCount: dummyTokens.length,
      failureCount: 0,
      responses: dummyTokens.map(() => ({ success: true })),
    };
  }

  // If there are real tokens but Firebase Admin not initialized, log warning
  if (!firebaseAdmin) {
    console.warn(
      "⚠️ Firebase Admin SDK not initialized, treating real tokens as dummy tokens"
    );
    console.log("📧 Notification (would be sent to real tokens):", {
      title: notification.title,
      body: notification.body,
      recipients: realTokens.length,
      data: data,
    });

    // Return mock response for all tokens
    return {
      successCount: tokens.length,
      failureCount: 0,
      responses: tokens.map(() => ({ success: true })),
    };
  }

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
      icon: notification.icon || "/logo.png",
    },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },
    webpush: {
      notification: {
        icon: notification.icon || "/logo.png",
        badge: "/logo.png",
        tag: notification.tag || "default",
        requireInteraction: false,
      },
      fcmOptions: {
        link: data.url || "/",
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast({
      ...message,
      tokens: realTokens,
    });
    console.log("Successfully sent messages:", response.successCount);
    console.log("Failed messages:", response.failureCount);

    // Combine with dummy token results
    return {
      successCount: response.successCount + dummyTokens.length,
      failureCount: response.failureCount,
      responses: [
        ...response.responses,
        ...dummyTokens.map(() => ({ success: true })),
      ],
    };
  } catch (error) {
    console.error("Error sending messages:", error);
    throw error;
  }
};

/**
 * Send notification to topic
 * @param {string} topic - Topic name
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 * @returns {Promise<string>} Message ID
 */
export const sendNotificationToTopic = async (
  topic,
  notification,
  data = {}
) => {
  if (!firebaseAdmin) {
    throw new Error("Firebase Admin SDK not initialized");
  }

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
      icon: notification.icon || "/logo.png",
    },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },
    topic: topic,
    webpush: {
      notification: {
        icon: notification.icon || "/logo.png",
        badge: "/logo.png",
        tag: notification.tag || "default",
        requireInteraction: false,
      },
      fcmOptions: {
        link: data.url || "/",
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message to topic:", response);
    return response;
  } catch (error) {
    console.error("Error sending message to topic:", error);
    throw error;
  }
};

/**
 * Subscribe tokens to topic
 * @param {string[]} tokens - Array of FCM tokens
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} Response
 */
export const subscribeToTopic = async (tokens, topic) => {
  if (!firebaseAdmin) {
    throw new Error("Firebase Admin SDK not initialized");
  }

  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log("Successfully subscribed to topic:", response);
    return response;
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    throw error;
  }
};

/**
 * Unsubscribe tokens from topic
 * @param {string[]} tokens - Array of FCM tokens
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} Response
 */
export const unsubscribeFromTopic = async (tokens, topic) => {
  if (!firebaseAdmin) {
    throw new Error("Firebase Admin SDK not initialized");
  }

  try {
    const response = await admin
      .messaging()
      .unsubscribeFromTopic(tokens, topic);
    console.log("Successfully unsubscribed from topic:", response);
    return response;
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
    throw error;
  }
};

export default firebaseAdmin;
