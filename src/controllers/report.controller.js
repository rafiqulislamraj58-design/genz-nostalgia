
import Report from "../models/report.model.js";
import Memory from "../models/memory.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Report a memory
export const reportMemory = asyncHandler(async (req, res) => {
  const { id: memoryId } = req.params;
  const userId = req.user?.userId || req.user?._id || req.user?.id;
  const { reason, details } = req.body;

  //
  const memory = await Memory.findOne({ _id: memoryId, status: "published" });
  if (!memory) {
    return res.status(404).json({ message: "Memory not found or already blocked" });
  }
// 
  const existingReport = await Report.findOne({
    memory: memoryId,
    reporter: userId,
    status: "pending",
  });

  if (existingReport) {
    return res.status(409).json({ message: "You already have a pending report for this memory" });
  }

// new  report
  const report = await Report.create({
    memory: memoryId,
    reporter: userId,
    reason,
    details,
  });

  return res.status(201).json({
    message: "Memory reported successfully",
    data: report,
  });
});