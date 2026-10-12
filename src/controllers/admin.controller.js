
import Report from "../models/report.model.js";
import Memory from "../models/memory.model.js";
import UserModel from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// pending  report  show
export const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ status: "pending" })
    .populate("memory", "title story author status")
    .populate("reporter", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    message: "Pending reports fetched successfully",
    data: reports
  });
});

// memore  bolck  unblock and update
export const updateMemoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, moderationReason } = req.body;

  if (!["published", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const memory = await Memory.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        moderatedBy: req.user.userId, //why  admin block
        moderationReason: moderationReason || null,
        moderatedAt: new Date()
      }
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!memory) {
    return res.status(404).json({ message: "Memory not found" });
  }

  // যদি মেমোরি ব্লক করা হয়, তবে এর সাথে সম্পর্কিত পেন্ডিং রিপোর্টগুলো 'reviewed' করে দেব
  if (status === "blocked") {
    await Report.updateMany(
      { memory: id, status: "pending" },
      { $set: { status: "reviewed", reviewedBy: req.user.userId, reviewedAt: new Date() } }
    );
  }

  return res.status(200).json({
    message: `Memory status updated to ${status}`,
    data: memory
  });
});

// ৩. ইউজার সাসপেন্ড বা রিঅ্যাক্টিভেট করা
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "suspended"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const user = await UserModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { returnDocument: "after", runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: `User status updated to ${status}`,
    data: { id: user._id, status: user.status }
  });
});