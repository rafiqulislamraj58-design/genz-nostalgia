
import { Router } from "express";
import {
  register,
  login,
  refresh,
  getMe,
  logout
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator
} from "../validator/auth.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;