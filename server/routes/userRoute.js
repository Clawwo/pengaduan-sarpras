import express from "express";
import {
  ambilPenggunaById,
  ambilSemuaPengguna,
  hapusPengguna,
  updatePengguna,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const roles = authMiddleware;
const router = express.Router();

router.get("/", roles(["admin"]), ambilSemuaPengguna);
router.get("/:id_user", roles(["admin"]), ambilPenggunaById);
router.put("/:id_pengguna", roles(["admin"]), updatePengguna);
router.delete("/:id_pengguna", roles(["admin"]), hapusPengguna);

export default router;
