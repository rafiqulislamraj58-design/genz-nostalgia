import Comment from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addComment = asyncHandler(async (req, res) => {
  const { id: memoryId } = req.params;
  const { text } = req.body;
  const userId = req.user?.userId || req.user?._id || req.user?.id;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  const comment = await Comment.create({
    memory: memoryId,
    author: userId,
    text: text.trim(),
  });


  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "name email"
  );

  return res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: populatedComment,
  });
});


export const getComments = asyncHandler(async (req, res) => {
  const { id: memoryId } = req.params;

  const comments = await Comment.find({ memory: memoryId })
    .populate("author", "name email")
    .sort({ createdAt: -1 }); 

  return res.status(200).json({
    success: true,
    count: comments.length,
    data: comments,
  });
});