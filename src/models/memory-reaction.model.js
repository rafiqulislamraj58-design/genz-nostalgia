
import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    memory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memory",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


reactionSchema.index({ memory: 1, user: 1 }, { unique: true });

export default mongoose.model("MemoryReaction", reactionSchema);