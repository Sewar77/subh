import {
  getAllUsers,
  getUserByEmail,
  getUserById,
} from "../models/auth.Models.js";

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
  const email = req.req;
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
