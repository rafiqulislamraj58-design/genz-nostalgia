
import express from "express";
import { uploadImage, deleteImage } from "../controllers/upload.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/images", authenticate, upload.single("image"), uploadImage);
router.delete("/images/:assetId", authenticate, deleteImage);

export default router;