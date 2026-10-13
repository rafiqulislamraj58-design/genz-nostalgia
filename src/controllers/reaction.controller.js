import MemoryReaction from "../models/memory-reaction.model.js";
import Memory from "../models/memory.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleReaction = asyncHandler(async (req, res) => {
  const { id: memoryId } = req.params;
  const userId = req.user?.userId || req.user?._id || req.user?.id;

  const memory = await Memory.findOne({ _id: memoryId, status: "published" });
  if (!memory) {
    return res.status(404).json({ message: "Memory not found or blocked" });
  }

  const existingReaction = await MemoryReaction.findOne({
    memory: memoryId,
    user: userId,
  });

  if (existingReaction) {
    await MemoryReaction.findByIdAndDelete(existingReaction._id);
    const count = await MemoryReaction.countDocuments({ memory: memoryId });

    return res.status(200).json({
      message: "Reaction removed",
      data: { reacted: false, totalReactions: count },
    });
  }

  await MemoryReaction.create({ memory: memoryId, user: userId });
  const count = await MemoryReaction.countDocuments({ memory: memoryId });

  return res.status(200).json({
    message: "Reaction added",
    data: { reacted: true, totalReactions: count },
  });
});