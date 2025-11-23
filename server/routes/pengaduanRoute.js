import express from "express";
import {
  createPengaduan,
  getAllPengaduan,
  getPengaduanByUser,
  updatePengaduanStatus,
  getPengaduanReport,
} from "../controllers/pengaduanController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadImage from "../middleware/uploadImageMiddleware.js";

const router = express.Router();

router.get("/report", authMiddleware(["admin"]), getPengaduanReport);

router.post(
  "/",
  authMiddleware(["pengguna"]),
  uploadImage("foto", 5), // Support up to 5 images
  createPengaduan
);

router.get("/pengaduanku", authMiddleware(["pengguna"]), getPengaduanByUser);

router.get("/", authMiddleware(["petugas", "admin"]), getAllPengaduan);

router.patch(
  "/:id/status",
  authMiddleware(["petugas", "admin"]),
  uploadImage("gambar", 5), // Support up to 5 bukti images
  updatePengaduanStatus
);

export default router;
