// routes/temporaryItemRoute.js
import express from "express";
import {
  createTemporaryItem,
  getAllTemporaryItems,
  deleteTemporaryItem,
  approveTemporaryItem,
  rejectTemporaryItem,
} from "../controllers/temporaryItemController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can moderate (approve/reject) temporary items
router.post("/", authMiddleware(["admin", "pengguna"]), createTemporaryItem);
router.get("/", authMiddleware(["admin", "petugas"]), getAllTemporaryItems);
router.post("/approve/:id", authMiddleware(["admin"]), approveTemporaryItem);
router.post("/reject/:id", authMiddleware(["admin"]), rejectTemporaryItem);
router.delete("/:id", authMiddleware(["admin"]), deleteTemporaryItem);

export default router;
