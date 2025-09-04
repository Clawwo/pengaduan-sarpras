import express from "express";
import {
  register,
  login,
  registerPetugas,
} from "../controllers/authControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const roles = authMiddleware;
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/register-petugas", roles(["admin"]), registerPetugas);

export default router;
