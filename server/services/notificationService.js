import pool from "../config/dbConfig.js";

/**
 * Save notification to history
 */
export const saveNotificationHistory = async (
  userId,
  title,
  body,
  type,
  data = {},
  status = "sent"
) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO notification_history (user_id, title, body, type, data, status, sent_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, title, body, type, JSON.stringify(data), status]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error saving notification history:", error);
    throw error;
  }
};

/**
 * Get unread notifications for user
 */
export const getUnreadNotifications = async (userId, limit = 10) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, body, type, data, status, sent_at, is_read
       FROM notification_history 
       WHERE user_id = ? AND is_read = 0
       ORDER BY sent_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows.map((row) => ({
      ...row,
      data: typeof row.data === "string" ? JSON.parse(row.data) : row.data,
    }));
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const [result] = await pool.query(
      "UPDATE notification_history SET is_read = 1 WHERE id = ? AND user_id = ? AND is_read = 0",
      [notificationId, userId]
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for user
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const [result] = await pool.query(
      "UPDATE notification_history SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Save or update FCM token untuk user
 */
export const saveOrUpdateFCMToken = async (
  userId,
  fcmToken,
  deviceInfo = {}
) => {
  const connection = await pool.getConnection();
  try {
    // Check if token already exists
    const [existing] = await connection.query(
      "SELECT id FROM fcm_tokens WHERE user_id = ? AND fcm_token = ?",
      [userId, fcmToken]
    );

    if (existing.length > 0) {
      // Update last_used
      await connection.query(
        "UPDATE fcm_tokens SET last_used = NOW(), device_info = ? WHERE id = ?",
        [JSON.stringify(deviceInfo), existing[0].id]
      );
      return existing[0].id;
    } else {
      // Insert new token
      const [result] = await connection.query(
        `INSERT INTO fcm_tokens (user_id, fcm_token, device_info, created_at, last_used) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [userId, fcmToken, JSON.stringify(deviceInfo)]
      );
      return result.insertId;
    }
  } finally {
    connection.release();
  }
};

/**
 * Get all FCM tokens for a user
 */
export const getUserFCMTokens = async (userId) => {
  const [rows] = await pool.query(
    "SELECT fcm_token FROM fcm_tokens WHERE user_id = ? AND is_active = 1",
    [userId]
  );
  return rows.map((row) => row.fcm_token);
};

/**
 * Get FCM tokens by role
 */
export const getFCMTokensByRole = async (role) => {
  // Normalize role to lowercase for comparison
  const normalizedRole = role ? role.toLowerCase() : "";
  
  const [rows] = await pool.query(
    `SELECT DISTINCT ft.fcm_token 
     FROM fcm_tokens ft 
     JOIN pengaduan_sarpras_user u ON ft.user_id = u.id_user 
     WHERE LOWER(u.role) = ? AND ft.is_active = 1`,
    [normalizedRole]
  );
  return rows.map((row) => row.fcm_token);
};

/**
 * Get all admin FCM tokens
 */
export const getAdminFCMTokens = async () => {
  return getFCMTokensByRole("admin");
};

/**
 * Get all petugas FCM tokens
 */
export const getPetugasFCMTokens = async () => {
  return getFCMTokensByRole("petugas");
};

/**
 * Delete FCM token
 */
export const deleteFCMToken = async (fcmToken) => {
  const [result] = await pool.query(
    "UPDATE fcm_tokens SET is_active = 0 WHERE fcm_token = ?",
    [fcmToken]
  );
  return result.affectedRows;
};

/**
 * Delete all FCM tokens for a user
 */
export const deleteUserFCMTokens = async (userId) => {
  const [result] = await pool.query(
    "UPDATE fcm_tokens SET is_active = 0 WHERE user_id = ?",
    [userId]
  );
  return result.affectedRows;
};

/**
 * Clean up old inactive tokens (older than 90 days)
 */
export const cleanupOldTokens = async () => {
  const [result] = await pool.query(
    "DELETE FROM fcm_tokens WHERE is_active = 0 AND last_used < DATE_SUB(NOW(), INTERVAL 90 DAY)"
  );
  return result.affectedRows;
};
