import {
  getAllUsers,
  getUserByEmail,
  getUserById,
  registerUserModel,
} from "../models/auth.Models.js";
import { deleteUser } from "../models/user.Model.js";

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    console.log(users);
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
    role,
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
      !role ||
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
      role: role,
    });
    return res.status(201).json({ message: "user added", user: user });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error in register", err });
  }
};
