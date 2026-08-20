import jwt from "jsonwebtoken";
import { getUserById } from "../models/auth.Models.js";
import { serializeUser } from "../utils/userSerializer.js";

export const optionalAuth = async (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || typeof decoded !== "object" || !decoded.id) return next();
    const user = await getUserById(decoded.id);
    if (user?.is_active === true) req.user = serializeUser(user);
  } catch {
    // Analytics remains non-blocking when an optional auth cookie is invalid.
  }
  return next();
};

