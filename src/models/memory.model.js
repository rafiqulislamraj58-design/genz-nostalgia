import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Memory title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    story: {
      type: String,
      required: [true, "Memory story is required"],
      trim: true,
      maxlength: [10000, "Story cannot exceed 10000 characters"],
    },

    category: {
      type: String,
      required: [true, "Memory category is required"],
      enum: [
        "childhood",
        "school-days",
        "friendship",
        "first-love",
        "old-technology",
        "festivals",
        "village-life",
        "internet-era",
        "36-july-memories",
        "other-memories",
      ],
    },

    images: [
      {
        url: {
          type: String,
          trim: true,
        },
        assetId: {
          type: String,
          trim: true,
        },
        altText: {
          type: String,
          trim: true,
          maxlength: [250, "Alt text cannot exceed 250 characters"],
        },
      },
    ],

    memoryYear: {
      type: Number,
      min: [1900, "Memory year must be 1900 or later"],
      max: [
        new Date().getFullYear(),
        "Memory year cannot be in the future",
      ],
      validate: {
        validator: (value) =>
          value == null || Number.isInteger(value),
        message: "Memory year must be a whole number",
      },
    },

    location: {
      type: String,
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
    },

    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [30, "Each tag cannot exceed 30 characters"],
        },
      ],
      default: [],
      validate: {
        validator: (tags) =>
          tags.length <= 10 &&
          tags.every((tag) => tag.length > 0),
        message: "Provide up to 10 non-empty tags",
      },
    },

    status: {
      type: String,
      enum: ["published", "blocked"],
      default: "published",
      required: true,
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    moderationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Moderation reason cannot exceed 500 characters"],
      default: null,
    },

    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

memorySchema.index({ status: 1, createdAt: -1 });
memorySchema.index({ category: 1, status: 1, createdAt: -1 });
memorySchema.index({ author: 1, createdAt: -1 });

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;