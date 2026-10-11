
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import {
  createAccessToken,
  createRefreshToken,
  readRefreshToken
} from "../utils/auth.utils.js";

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth"
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, cookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", clearCookieOptions);
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

const issueTokens = async (user, res) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role
  };

  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();

  setRefreshCookie(res, refreshToken);

  return {
    user: publicUser(user),
    accessToken
  };
};

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await UserModel.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email"
      });
    }

    const PassHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      PassHash
    });

    const data = await issueTokens(user, res);

    return res.status(201).json({
      message: "Registration successful",
      data
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists with this email"
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      message: "Unable to register user"
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email: email.trim().toLowerCase()
    }).select("+PassHash");

    if (!user || !user.PassHash) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.PassHash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is suspended"
      });
    }

    const data = await issueTokens(user, res);

    return res.status(200).json({
      message: "Login successful",
      data
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login"
    });
  }
}

export async function refresh(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    clearRefreshCookie(res);

    return res.status(401).json({
      message: "Refresh token cookie is missing"
    });
  }

  try {
    const decoded = readRefreshToken(refreshToken);

    if (!decoded.userId) {
      clearRefreshCookie(res);

      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const oldTokenHash = hashRefreshToken(refreshToken);

    const user = await UserModel.findOne({
      _id: decoded.userId,
      status: "active",
      refreshTokenHash: oldTokenHash
    }).select("+refreshTokenHash");

    if (!user) {
      clearRefreshCookie(res);

      return res.status(401).json({
        message: "Invalid or revoked refresh token"
      });
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role
    };

    const accessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);
    const newTokenHash = hashRefreshToken(newRefreshToken);

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: user._id,
        status: "active",
        refreshTokenHash: oldTokenHash
      },
      {
        $set: {
          refreshTokenHash: newTokenHash
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!updatedUser) {
      clearRefreshCookie(res);

      return res.status(401).json({
        message: "Refresh token has already been used or revoked"
      });
    }

    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        user: publicUser(updatedUser),
        accessToken
      }
    });
  } catch (error) {
    clearRefreshCookie(res);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired refresh token"
      });
    }

    console.error("Refresh error:", error);

    return res.status(500).json({
      message: "Unable to refresh token"
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is suspended"
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: {
        user: publicUser(user)
      }
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      message: "Unable to fetch user"
    });
  }
}

export async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (refreshToken) {
      const decoded = readRefreshToken(refreshToken);
      const tokenHash = hashRefreshToken(refreshToken);

      await UserModel.updateOne(
        {
          _id: decoded.userId,
          refreshTokenHash: tokenHash
        },
        {
          $set: {
            refreshTokenHash: null
          }
        }
      );
    }
  } catch (error) {
    if (
      error.name !== "TokenExpiredError" &&
      error.name !== "JsonWebTokenError" &&
      error.name !== "NotBeforeError"
    ) {
      console.error("Logout error:", error);
    }
  }

  clearRefreshCookie(res);

  return res.status(200).json({
    message: "Logged out successfully"
  });
}

