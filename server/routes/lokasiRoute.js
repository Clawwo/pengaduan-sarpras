import express from "express";
import {
  getAllLokasi,
  getLokasiById,
  createLokasi,
  updateLokasi,
  deleteLokasi,
} from "../controllers/lokasiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua role bisa lihat lokasi
router.get("/", authMiddleware(["admin", "petugas", "pengguna"]), getAllLokasi);
router.get(
  "/:id",
  authMiddleware(["admin", "petugas", "pengguna"]),
  getLokasiById
);

// Hanya admin bisa manage lokasi
router.post("/", authMiddleware(["admin"]), createLokasi);
router.put("/:id", authMiddleware(["admin"]), updateLokasi);
router.delete("/:id", authMiddleware(["admin"]), deleteLokasi);

export default router;
