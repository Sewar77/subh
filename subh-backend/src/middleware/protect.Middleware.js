import jwt from "jsonwebtoken";
import { getUserById } from "../models/auth.Models.js";
import { serializeUser } from "../utils/userSerializer.js";

export const protect = async (req, res, next) => {
  const token = req?.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await getUserById(decoded.id);

    if (!user || user.is_active !== true) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.user = serializeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
