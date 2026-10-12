
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    memory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memory",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "Inappropriate content",
        "Harassment or hate",
        "Spam",
        "Copyright concern",
        "Privacy concern",
        "Other"
      ],
    },
    details: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },
    adminNote: { type: String, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);


reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);