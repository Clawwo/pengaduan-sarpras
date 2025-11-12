import {
  saveOrUpdateFCMToken,
  getUserFCMTokens,
  deleteFCMToken,
  getAdminFCMTokens,
  getPetugasFCMTokens,
  saveNotificationHistory,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService.js";
import {
  sendNotificationToToken,
  sendNotificationToMultipleTokens,
} from "../config/firebaseAdmin.js";
import pool from "../config/dbConfig.js";

/**
 * Register FCM token untuk user
 * Alternatif: Accept dummy token dari frontend
 */
export const registerFCMToken = async (req, res) => {
  try {
    const { fcmToken, deviceInfo } = req.body;
    const userId = req.user.id;

    console.log("📱 Register FCM Token Request:");
    console.log("  - User ID:", userId);
    console.log("  - FCM Token:", fcmToken?.substring(0, 50) + "...");
    console.log("  - Device Info:", deviceInfo);

    // If no token provided, generate a dummy one for testing
    let tokenToSave = fcmToken;
    if (!tokenToSave) {
      // Generate dummy token based on user ID and timestamp
      tokenToSave = `dummy_fcm_token_${userId}_${Date.now()}`;
      console.log("⚠️ No FCM token provided, using dummy token:", tokenToSave);
    }

    await saveOrUpdateFCMToken(userId, tokenToSave, deviceInfo || {});

    console.log("✅ FCM token registered successfully for user:", userId);
    res.json({
      message: "FCM token registered successfully",
      token: tokenToSave.substring(0, 50) + "...",
      isDummy: !fcmToken,
    });
  } catch (error) {
    console.error("❌ Error registering FCM token:", error);
    res.status(500).json({ message: "Failed to register FCM token" });
  }
};

/**
 * Delete FCM token (untuk logout)
 */
export const deleteFCMTokenController = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    await deleteFCMToken(fcmToken);

    res.json({ message: "FCM token deleted successfully" });
  } catch (error) {
    console.error("Error deleting FCM token:", error);
    res.status(500).json({ message: "Failed to delete FCM token" });
  }
};

/**
 * Get user's FCM tokens
 */
export const getUserTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokens = await getUserFCMTokens(userId);

    res.json({ tokens });
  } catch (error) {
    console.error("Error getting user tokens:", error);
    res.status(500).json({ message: "Failed to get user tokens" });
  }
};

/**
 * Get unread notifications for current user
 */
export const getUnreadNotificationsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await getUnreadNotifications(userId, limit);

    res.json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    res.status(500).json({ message: "Failed to get unread notifications" });
  }
};

/**
 * Mark notification as read
 */
export const markAsReadController = async (req, res) => {
  try {
    const { id } = req.params;

    await markNotificationAsRead(id);

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsReadController = async (req, res) => {
  try {
    const userId = req.user.id;

    const affectedRows = await markAllNotificationsAsRead(userId);

    res.json({
      message: "All notifications marked as read",
      count: affectedRows,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({ message: "Failed to mark all notifications as read" });
  }
};

/**
 * Send test notification to user
 */
export const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokens = await getUserFCMTokens(userId);

    if (tokens.length === 0) {
      return res.status(404).json({ message: "No FCM tokens found for user" });
    }

    const notification = {
      title: "Test Notification",
      body: "This is a test notification from Pengaduan Sarpras",
      icon: "/logo.png",
    };

    const data = {
      url: "/",
      type: "test",
    };

    await sendNotificationToToken(tokens[0], notification, data);

    res.json({ message: "Test notification sent successfully" });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ message: "Failed to send test notification" });
  }
};

/**
 * Send notification ke admin (admin only)
 */
export const notifyAdmins = async (notification, data = {}) => {
  try {
    const tokens = await getAdminFCMTokens();

    if (tokens.length === 0) {
      console.log("No admin FCM tokens found");
      return { success: 0, failure: 0 };
    }

    const response = await sendNotificationToMultipleTokens(
      tokens,
      notification,
      data
    );

    // Save to notification history (untuk setiap admin)
    // Get all admin user IDs
    const [adminUsers] = await pool.query(
      "SELECT id_user FROM pengaduan_sarpras_user WHERE role = 'admin'"
    );

    for (const admin of adminUsers) {
      await saveNotificationHistory(
        admin.id_user,
        notification.title,
        notification.body,
        data.type || "general",
        data,
        "sent"
      );
    }

    return {
      success: response.successCount,
      failure: response.failureCount,
    };
  } catch (error) {
    console.error("Error notifying admins:", error);
    throw error;
  }
};

/**
 * Send notification ke petugas (admin only)
 */
export const notifyPetugas = async (notification, data = {}) => {
  try {
    const tokens = await getPetugasFCMTokens();

    if (tokens.length === 0) {
      console.log("No petugas FCM tokens found");
      return { success: 0, failure: 0 };
    }

    const response = await sendNotificationToMultipleTokens(
      tokens,
      notification,
      data
    );

    // Save to notification history (untuk setiap petugas)
    const [petugasUsers] = await pool.query(
      "SELECT id_user FROM pengaduan_sarpras_user WHERE role = 'petugas'"
    );

    for (const petugas of petugasUsers) {
      await saveNotificationHistory(
        petugas.id_user,
        notification.title,
        notification.body,
        data.type || "general",
        data,
        "sent"
      );
    }

    return {
      success: response.successCount,
      failure: response.failureCount,
    };
  } catch (error) {
    console.error("Error notifying petugas:", error);
    throw error;
  }
};

/**
 * Send notification ke specific user
 */
export const notifyUser = async (userId, notification, data = {}) => {
  try {
    const tokens = await getUserFCMTokens(userId);

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for user ${userId}`);
      // Still save to history even if no tokens
      await saveNotificationHistory(
        userId,
        notification.title,
        notification.body,
        data.type || "general",
        data,
        "pending" // pending karena tidak ada token
      );
      return { success: 0, failure: 0 };
    }

    const response = await sendNotificationToMultipleTokens(
      tokens,
      notification,
      data
    );

    // Save to notification history
    await saveNotificationHistory(
      userId,
      notification.title,
      notification.body,
      data.type || "general",
      data,
      response.successCount > 0 ? "sent" : "failed"
    );

    return {
      success: response.successCount,
      failure: response.failureCount,
    };
  } catch (error) {
    console.error(`Error notifying user ${userId}:`, error);

    // Save failed notification to history
    try {
      await saveNotificationHistory(
        userId,
        notification.title,
        notification.body,
        data.type || "general",
        data,
        "failed"
      );
    } catch (historyError) {
      console.error(
        "Error saving failed notification to history:",
        historyError
      );
    }

    throw error;
  }
};
