import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  getUserByEmailForAuth,
  normalizeEmail,
  normalizeFullName,
} from "../models/auth.Models.js";
import { getCompanyProfileByUserId } from "../models/companyProfile.Model.js";
import { registerUserAccount } from "../services/auth/registerUserService.js";
import { serializeUser } from "../utils/userSerializer.js";
import { getValidated } from "../middleware/validate.Middleware.js";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from "../config/authCookie.js";

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
      companyName,
      employeeCount,
      ein,
      registrationNumber,
      registrationState,
      website,
    } = getValidated(req, "body");
    const normalizedEmail = normalizeEmail(email);

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (await getUserByEmailForAuth(normalizedEmail)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const registration = await registerUserAccount({
      user: {
        fullName: normalizeFullName(fullName ?? name),
        email: normalizedEmail,
        phoneNumber,
        hashedPassword: await bcrypt.hash(password, 10),
        role: "user",
        userType,
      },
      companyProfile:
        userType === "company"
          ? {
              companyName,
              employeeCount,
              ein,
              registrationNumber,
              registrationState,
              website,
            }
          : null,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: serializeUser(registration.user, {
        companyProfile: registration.companyProfile,
        companyView: "summary",
      }),
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
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return res.status(200).json({
      message: "Login successful",
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const currentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const companyProfile =
      req.user.userType === "company"
        ? await getCompanyProfileByUserId(req.user.id)
        : null;

    return res.status(200).json({
      message: "User info",
      user: serializeUser(req.user, {
        companyProfile,
        companyView: "summary",
      }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) =>
  res
    .clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions({ clear: true }))
    .status(204)
    .send();
