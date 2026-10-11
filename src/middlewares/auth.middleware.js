
import { readAccessToken } from "../utils/auth.utils.js";

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token is required"
    });
  }

  const accessToken = authorization.split(" ")[1];

  try {
    const decoded = readAccessToken(accessToken);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token"
    });
  }
}