import express from "express";
import {
  getAllListLokasi,
  getListLokasiById,
  createListLokasi,
  updateListLokasi,
  deleteListLokasi,
} from "../controllers/listLokasiController.js";
import authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua role bisa lihat data list lokasi
router.get(
  "/",
  authMiddleware(["admin", "petugas", "pengguna"]),
  getAllListLokasi
);
router.get(
  "/:id",
  authMiddleware(["admin", "petugas", "pengguna"]),
  getListLokasiById
);

// Hanya admin yang bisa CRUD
router.post("/", authMiddleware(["admin"]), createListLokasi);
router.put("/:id", authMiddleware(["admin"]), updateListLokasi);
router.delete("/:id", authMiddleware(["admin"]), deleteListLokasi);

export default router;
