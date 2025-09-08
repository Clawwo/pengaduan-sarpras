import express from "express";
import {
  getPetugas,
  getPetugasById,
  deletePetugas,
} from "../controllers/petugasController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin only
router.get("/", authMiddleware(["admin"]), getPetugas);
router.get("/:id", authMiddleware(["admin"]), getPetugasById);
router.delete("/:id", authMiddleware(["admin"]), deletePetugas);

export default router;
