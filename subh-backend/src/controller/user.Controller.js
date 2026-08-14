import bcrypt from "bcryptjs";
import {
  createUser,
  getAllUsers,
  getUserByEmailForAuth,
  getUserByEmailSafe,
  getUserById,
  normalizeEmail,
  normalizeFullName,
} from "../models/auth.Models.js";
import {
  deactivateUser,
  updateUser,
  updateUserPassword,
} from "../models/user.Model.js";
import { serializeUser } from "../utils/userSerializer.js";
import { getValidated } from "../middleware/validate.Middleware.js";
import { getCompanyProfileByUserId } from "../models/companyProfile.Model.js";

const isDuplicateEmailError = (error) => error?.code === "23505";
const isLastActiveAdminError = (error) => error?.code === "LAST_ACTIVE_ADMIN";

const errorResponse = (res, error) => {
  if (isDuplicateEmailError(error)) {
    return res.status(409).json({ message: "Email already exists" });
  }
  if (isLastActiveAdminError(error)) {
    return res.status(409).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      message: "Users found",
      users: users.map(serializeUser),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const user = await getUserById(getValidated(req, "params").id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const companyProfile =
      user.user_type === "company"
        ? await getCompanyProfileByUserId(user.id)
        : null;

    return res.status(200).json({
      message: "User found",
      user: serializeUser(user, {
        companyProfile,
        companyView: "admin",
      }),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getUserByEmailController = async (req, res) => {
  try {
    const user = await getUserByEmailSafe(getValidated(req, "query").email);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User found",
      user: serializeUser(user),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const addNewUserController = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
      phoneNumber,
      phone_Number: legacyPhoneNumber,
      userType,
      role,
      userRole,
      isActive,
      emailVerified,
    } = getValidated(req, "body");
    const normalizedEmail = normalizeEmail(email);

    if (await getUserByEmailForAuth(normalizedEmail)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await createUser({
      fullName: normalizeFullName(fullName ?? name),
      email: normalizedEmail,
      phoneNumber: phoneNumber ?? legacyPhoneNumber ?? null,
      hashedPassword: await bcrypt.hash(password, 10),
      role: role ?? userRole ?? "user",
      userType,
      isActive,
      emailVerified,
    });

    return res.status(201).json({
      message: "User added",
      user: serializeUser(user),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateUserController = async (req, res) => {
  try {
    const payload = {};
    const {
      name,
      fullName,
      email,
      phoneNumber,
      userType,
      role,
      userRole,
      isActive,
      emailVerified,
    } = getValidated(req, "body");

    if (name !== undefined || fullName !== undefined) {
      payload.fullName = normalizeFullName(fullName ?? name);
    }
    if (email !== undefined) payload.email = normalizeEmail(email);
    if (phoneNumber !== undefined) payload.phoneNumber = phoneNumber;
    if (userType !== undefined) payload.userType = userType;
    if (role !== undefined || userRole !== undefined) {
      payload.role = role ?? userRole;
    }
    if (isActive !== undefined) payload.isActive = isActive;
    if (emailVerified !== undefined) payload.emailVerified = emailVerified;

    const user = await updateUser(getValidated(req, "params").id, payload);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const user = await deactivateUser(getValidated(req, "params").id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(204).send();
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateUserStatusController = async (req, res) => {
  try {
    const user = await updateUser(getValidated(req, "params").id, {
      isActive: getValidated(req, "body").isActive,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User status updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateUserPasswordController = async (req, res) => {
  try {
    const user = await updateUserPassword(
      getValidated(req, "params").id,
      await bcrypt.hash(getValidated(req, "body").password, 10),
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User password updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};
