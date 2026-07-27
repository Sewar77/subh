import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  getUserByEmailForAuth,
  normalizeEmail,
  normalizeFullName,
} from "../models/auth.Models.js";
import { serializeUser } from "../utils/userSerializer.js";
import { getValidated } from "../middleware/validate.Middleware.js";

const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const getCookieOptions = (isClear = false) => ({
  httpOnly: true,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  ...(isClear ? { expires: new Date(0) } : { maxAge: AUTH_COOKIE_MAX_AGE_MS }),
});

const isDuplicateEmailError = (error) => error?.code === "23505";

export const registerUserController = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      userType,
    } = getValidated(req, "body");
    const normalizedEmail = normalizeEmail(email);

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (await getUserByEmailForAuth(normalizedEmail)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await createUser({
      fullName: normalizeFullName(fullName ?? name),
      email: normalizedEmail,
      phoneNumber,
      hashedPassword: await bcrypt.hash(password, 10),
      role: "user",
      userType,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const body = getValidated(req, "body");
    const user = await getUserByEmailForAuth(normalizeEmail(body.email));

    if (!user || user.is_active !== true) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(
      body.password,
      user.hashed_password,
    );
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());

    return res.status(200).json({
      message: "Login successful",
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const currentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({
    message: "User info",
    user: req.user,
  });
};

export const logout = (req, res) =>
  res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions(true)).status(204).send();
