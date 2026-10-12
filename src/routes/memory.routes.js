import express from "express";

import {
  createMemory,
  getMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
  getMyMemories,
} from "../controllers/memory.controller.js";

// Reaction controller import
import { toggleReaction } from "../controllers/reaction.controller.js"; 

import { authenticate } from "../middlewares/auth.middleware.js";
import { createMemoryValidator } from "../validator/memory.validator.js";

const router = express.Router();

// Public route — Get all published memories
router.get("/", getMemories);

// Protected route — Get logged-in user's memories
router.get("/mine", authenticate, getMyMemories);

// Public route — Get single memory by ID
router.get("/:id", getMemoryById);

// Protected route — Create a new memory with validation
router.post("/", authenticate, createMemoryValidator, createMemory);

// Protected route — Update your own memory
router.patch("/:id", authenticate, updateMemory);

// Protected route — Delete your own memory
router.delete("/:id", authenticate, deleteMemory);

// Protected route — Toggle Reaction (I Remember This Too)
router.put("/:id/reaction", authenticate, toggleReaction);

export default router;