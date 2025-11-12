import express from "express";
import {
  registerFCMToken,
  deleteFCMTokenController,
  getUserTokens,
  sendTestNotification,
  getUnreadNotificationsController,
  markAsReadController,
  markAllAsReadController,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register FCM token (all authenticated users)
router.post("/register-token", authMiddleware(), registerFCMToken);

// Delete FCM token (all authenticated users)
router.post("/delete-token", authMiddleware(), deleteFCMTokenController);

// Get user's FCM tokens (all authenticated users)
router.get("/my-tokens", authMiddleware(), getUserTokens);

// Get unread notifications
router.get("/unread", authMiddleware(), getUnreadNotificationsController);

// Mark notification as read
router.patch("/:id/read", authMiddleware(), markAsReadController);

// Mark all notifications as read
router.patch("/read-all", authMiddleware(), markAllAsReadController);

// Send test notification (all authenticated users)
router.post("/test", authMiddleware(), sendTestNotification);

export default router;
