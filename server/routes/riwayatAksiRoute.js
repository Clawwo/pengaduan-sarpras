import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllRiwayatAksi,
  getRiwayatAksiByPengaduan,
  getRiwayatAksiStatistics,
  getRiwayatAksiPerPetugas,
} from "../controllers/riwayatAksiController.js";

const router = express.Router();

// Semua endpoint riwayat aksi hanya untuk admin
// Gunakan authMiddleware dengan roles=['admin']
const requireAdmin = authMiddleware(["admin"]);

/**
 * GET /api/riwayat-aksi
 * Query params:
 * - id_petugas: Filter by petugas (optional)
 * - startDate: Filter tanggal mulai (YYYY-MM-DD) (optional)
 * - endDate: Filter tanggal akhir (YYYY-MM-DD) (optional)
 * - status: Filter by status baru (optional)
 * - search: Search keyword (optional)
 * - page: Halaman (default: 1)
 * - limit: Jumlah per halaman (default: 20)
 */
router.get("/", requireAdmin, getAllRiwayatAksi);

/**
 * GET /api/riwayat-aksi/statistics
 * Mendapatkan statistik riwayat aksi
 */
router.get("/statistics", requireAdmin, getRiwayatAksiStatistics);

/**
 * GET /api/riwayat-aksi/per-petugas
 * Mendapatkan riwayat aksi per petugas (leaderboard)
 */
router.get("/per-petugas", requireAdmin, getRiwayatAksiPerPetugas);

/**
 * GET /api/riwayat-aksi/pengaduan/:id
 * Mendapatkan riwayat aksi untuk satu pengaduan tertentu
 */
router.get("/pengaduan/:id", requireAdmin, getRiwayatAksiByPengaduan);

export default router;
