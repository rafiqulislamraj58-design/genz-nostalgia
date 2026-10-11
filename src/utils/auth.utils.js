
import config from "../config/config.js";
import jwt from "jsonwebtoken";

export function createAccessToken({ userId, role }) {
  return jwt.sign(
    { userId, role },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

export function createRefreshToken({ userId, role }) {
  return jwt.sign(
    { userId, role },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

export function readRefreshToken(token) {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET);
}

export function readAccessToken(token) {
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET);
}

