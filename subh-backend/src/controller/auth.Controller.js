import {
  getUserByEmail,
  getUserById,
  registerUserModel,
} from "../models/auth.Models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUserController = async (req, res) => {
  try {
    const { name, email, password, userType, phoneNumber, role } = req.body;
    const isUserExist = await getUserByEmail(email);

    if (isUserExist) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const user = await registerUserModel({
      name,
      email,
      hashed_password,
      userType,
      phoneNumber,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginUserController = async (req, res) => {
  const { password, email } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Should fill all info" });
    }
    const isUserExist = await getUserByEmail(email);
    if (!isUserExist) {
      return res.status(400).json({ message: "email not found" });
    }
    const isMatch = await bcrypt.compare(password, isUserExist.hashed_password);
    if (!isMatch) {
      return res.status(400).json({ message: "password not correct" });
    }
    const token = jwt.sign(
      { id: isUserExist.id, email: isUserExist.email, role: isUserExist.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return res.status(200).json({
      message: "Login successful",
      user: isUserExist,
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", err });
  }
};

export const currentUser = async (req, res) => {
  try {
    const me = req.user.id;
    const user = await getUserById(me);

    if (!user) {
      return res.status(401).json({ message: "unautherzed", err });
    }
    return res.status(200).json({ message: "user infor", user: user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", err });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({ message: "logged out" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", err });
  }
};
