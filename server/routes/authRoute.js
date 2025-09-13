import { Router } from "express";
import {
  register,
  login,
  registerPetugas,
} from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
  validatePetugas,
} from "../middleware/validateInputMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.post("/register", authRateLimiter, validateRegister, register);
router.post("/login", authRateLimiter, validateLogin, login);
router.post(
  "/register-petugas",
  authMiddleware(["admin"]),
  validateRegister,
  validatePetugas,
  registerPetugas
);

export default router;
