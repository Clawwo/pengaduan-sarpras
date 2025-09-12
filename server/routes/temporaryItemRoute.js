// routes/temporaryItemRoute.js
import express from "express";
import {
  createTemporaryItem,
  getAllTemporaryItems,
  deleteTemporaryItem,
  approveTemporaryItem,
} from "../controllers/temporaryItemController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// hanya admin/petugas yang bisa approve
router.post("/", authMiddleware(["admin", "pengguna"]), createTemporaryItem);
router.get("/", authMiddleware(["admin", "petugas"]), getAllTemporaryItems);
router.delete("/:id", authMiddleware(["admin"]), deleteTemporaryItem);
router.post(
  "/approve/:id",
  authMiddleware(["admin", "petugas"]),
  approveTemporaryItem
);

export default router;
