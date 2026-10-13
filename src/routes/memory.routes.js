import express from "express";

import {
  createMemory,
  getMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
  getMyMemories,
} from "../controllers/memory.controller.js";

// Controller imports
import { toggleReaction } from "../controllers/reaction.controller.js"; 
import { reportMemory } from "../controllers/report.controller.js";
import { addComment, getComments } from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createMemoryValidator } from "../validator/memory.validator.js";

const router = express.Router();

// Public route — Get all published memories
router.get("/", getMemories);

// ⚠️ গুরুত্বপূর্ণ: স্ট্যাটিক রাউটগুলো সবসময় ডাইনামিক `/:id` এর উপরে রাখতে হবে
// Protected route — Get logged-in user's memories
router.get("/mine", authenticate, getMyMemories);

// Protected route — Report a memory (Frontend-এর সাথে মিল রেখে /:id/report এবং /:id/reports উভয় সাপোর্ট করতে পারে অথবা একটি রাখতে পারো)
router.post("/:id/report", authenticate, reportMemory);
router.post("/:id/reports", authenticate, reportMemory);

// Protected route — Create a new memory with validation
router.post("/", authenticate, createMemoryValidator, createMemory);

// Public route — Get single memory by ID (এটি নিচে থাকবে)
router.get("/:id", getMemoryById);

// Protected route — Update your own memory
router.patch("/:id", authenticate, updateMemory);

// Protected route — Delete your own memory
router.delete("/:id", authenticate, deleteMemory);

// Protected route — Toggle Reaction (I Remember This Too)
router.put("/:id/reaction", authenticate, toggleReaction);

// === Comment Routes ===
// Public route — Get all comments for a specific memory
router.get("/:id/comments", getComments);

// Protected route — Add a new comment to a specific memory
router.post("/:id/comments", authenticate, addComment);

export default router;