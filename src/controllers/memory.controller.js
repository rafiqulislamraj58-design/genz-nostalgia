import mongoose from "mongoose";
import Memory from "../models/memory.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 

// Escape special characters before using a search term in a regular expression
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Create a new memory
export const createMemory = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const { title, story, category, memoryYear, location, tags } = req.body;

  const memory = await Memory.create({
    author: userId,
    title,
    story,
    category,
    memoryYear,
    location,
    tags,
  });

  return res.status(201).json({
    message: "Memory created successfully",
    data: memory,
  });
});

// Get published memories with search, filters, and pagination
export const getMemories = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const requestedLimit = Number.parseInt(req.query.limit, 10) || 12;
  const limit = Math.min(50, Math.max(1, requestedLimit));
  
  const skip = (page - 1) * limit;
  
  const filter = { status: "published" };
  const { search, category, year, location } = req.query;

  if (category) filter.category = category;
  
  if (year !== undefined) {
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear)) {
      return res.status(400).json({ message: "Year must be a valid integer" });
    }
    filter.memoryYear = parsedYear;
  }

  if (location) {
    filter.location = {
      $regex: escapeRegExp(String(location).slice(0, 150)),
      $options: "i",
    };
  }

  if (search) {
    const keyword = escapeRegExp(String(search).slice(0, 100));
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { story: { $regex: keyword, $options: "i" } },
    ];
  }

  const [memories, total] = await Promise.all([
    Memory.find(filter)
      .select("-moderatedBy -moderationReason -moderatedAt")
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Memory.countDocuments(filter),
  ]);

  return res.status(200).json({
    message: "Memories fetched successfully",
    data: memories,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Get my memories
export const getMyMemories = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const requestedLimit = Number.parseInt(req.query.limit, 10) || 12;
  const limit = Math.min(50, Math.max(1, requestedLimit));
  
  const skip = (page - 1) * limit;

  const filter = { author: userId };

  const [memories, total] = await Promise.all([
    Memory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Memory.countDocuments(filter),
  ]);

  return res.status(200).json({
    message: "Your memories fetched successfully",
    data: memories,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Update a memory owned by the authenticated user
export const updateMemory = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid memory ID" });
  }

  const allowedFields = ["title", "story", "category", "memoryYear", "location", "tags"];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  const memory = await Memory.findOneAndUpdate(
    { _id: id, author: userId },
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  );

  if (!memory) {
    return res.status(404).json({ message: "Memory not found or you do not own this memory" });
  }

  return res.status(200).json({
    message: "Memory updated successfully",
    data: memory,
  });
});

// Delete a memory owned by the authenticated user
export const deleteMemory = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid memory ID" });
  }

  const memory = await Memory.findOneAndDelete({ _id: id, author: userId });

  if (!memory) {
    return res.status(404).json({ message: "Memory not found or you do not own this memory" });
  }

  return res.status(200).json({ message: "Memory deleted successfully" });
});

// Get a single published memory by ID
export const getMemoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid memory ID" });
  }

  const memory = await Memory.findOne({ _id: id, status: "published" })
    .populate("author", "name avatar")
    .lean();

  if (!memory) {
    return res.status(404).json({ message: "Memory not found or is restricted" });
  }

  return res.status(200).json({
    message: "Memory fetched successfully",
    data: memory,
  });
});