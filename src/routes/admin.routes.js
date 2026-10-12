
import express from "express";
import {
  getReports,
  updateMemoryStatus,
  updateUserStatus
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// mendatore
router.use(authenticate, authorizeAdmin);

router.get("/reports", getReports);
router.patch("/memories/:id/status", updateMemoryStatus);
router.patch("/users/:id/status", updateUserStatus);

export default router;