import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Hanya admin yang boleh kelola user
router.get("/", authMiddleware(["admin"]), getUsers);
router.get("/:id", authMiddleware(["admin"]), getUserById);
router.post("/", authMiddleware(["admin"]), createUser);
router.put("/:id", authMiddleware(["admin"]), updateUser);
router.delete("/:id", authMiddleware(["admin"]), deleteUser);

router.put(
  "/me",
  authMiddleware(["admin", "pengguna", "petugas"]),
  updateProfile
);

export default router;
