import express from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua role bisa lihat daftar item
router.get("/", authMiddleware(["admin", "petugas", "pengguna"]), getAllItems);
router.get(
  "/:id",
  authMiddleware(["admin", "petugas", "pengguna"]),
  getItemById
);

// CRUD hanya admin & petugas
router.post("/", authMiddleware(["admin", "petugas"]), createItem);
router.put("/:id", authMiddleware(["admin", "petugas"]), updateItem);
router.delete("/:id", authMiddleware(["admin", "petugas"]), deleteItem);

export default router;
