import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  ambilSemuaLokasi,
  hapusLokasi,
  tambahLokasi,
  updateLokasi,
} from "../controllers/lokasiController.js";

const roles = authMiddleware;
const router = express.Router();

router.post("/tambah-lokasi", roles(["admin"]), tambahLokasi);
router.get("/", roles(["admin"]), ambilSemuaLokasi);
router.put("/:id_lokasi", roles(["admin"]), updateLokasi);
router.delete("/:id_lokasi", roles(["admin"]), hapusLokasi);

export default router;
