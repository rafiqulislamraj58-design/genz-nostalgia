
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    PassHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;