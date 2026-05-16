import {
  getAllUsers,
  getUserByEmail,
  getUserById,
  registerUserModel,
} from "../models/auth.Models.js";
import { deleteUser, updateUser } from "../models/user.Model.js";
import bcrypt from "bcryptjs";
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      return res.status(200).json({ message: "No users yert", users: [] });
    }
    return res.status(200).json({ message: "users found", users: users });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserByIdController = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ message: "user found", user: user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserByEmailController = async (req, res) => {
  const email = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ message: "user found", user: user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserController = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    await deleteUser(userId);
    return res.status(200).json({ message: "user eleted" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const addNewUserController = async (req, res) => {
  const {
    name,
    password,
    confirmPassword,
    email,
    userRole,
    phone_Number,
    userType,
    address,
  } = req.body;
  try {
    if (
      !name ||
      !email ||
      !confirmPassword ||
      !password ||
      !userRole ||
      !userType
    ) {
      return res.status(400).json({ message: "Should fill all info" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "passwords should match" });
    }
    const isUserExist = await getUserByEmail(email);
    if (isUserExist) {
      return res.status(400).json({ message: "email registed already" });
    }
    const hashed_password = await bcrypt.hash(password, 10);
    const user = await registerUserModel({
      name,
      email,
      hashed_password,
      phone_Number,
      address,
      userType: userType,
      role: userRole,
    });
    return res.status(201).json({ message: "user added", user: user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error in register", err });
  }
};
export const updateUserController = async (req, res) => {
  const userId = req.params.id;
  const { userType, userRole } = req.body;

  try {
    console.log("body:", req.body);
    console.log("userId:", userId);

    const existingUser = await getUserById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updateFields = {};

    if (userType !== undefined && userType !== "") {
      updateFields.user_type = userType;
    }

    if (userRole !== undefined && userRole !== "") {
      updateFields.role = userRole;
    }
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    const updatedUser = await updateUser(
      userId,
      updateFields.user_type,
      updateFields.role,
    );
    console.log("updated===", updatedUser);

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      err,
    });
  }
};
