import express from "express";
import {
  getAllKategoriLokasi,
  getKategoriLokasiById,
  getLokasiByKategori,
} from "../controllers/kategoriLokasiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua role bisa lihat kategori lokasi
router.get(
  "/",
  authMiddleware(["admin", "petugas", "pengguna"]),
  getAllKategoriLokasi
);

router.get(
  "/:id",
  authMiddleware(["admin", "petugas", "pengguna"]),
  getKategoriLokasiById
);

// Get lokasi by kategori
router.get(
  "/:id/lokasi",
  authMiddleware(["admin", "petugas", "pengguna"]),
  getLokasiByKategori
);

export default router;
