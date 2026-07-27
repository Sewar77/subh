import express from "express";
import {
  addNewUserController,
  deleteUserController,
  getAllUsersController,
  getUserByEmailController,
  getUserByIdController,
  updateUserController,
  updateUserPasswordController,
  updateUserStatusController,
} from "../controller/user.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  adminCreateUserSchema,
  adminPasswordUpdateSchema,
  adminUpdateUserSchema,
  emailLookupSchema,
  userIdParamSchema,
  userStatusSchema,
} from "../validation/auth.Validation.js";

const route = express.Router();
const admin = [protect, adminOnly];

const validateUserId = validate(userIdParamSchema, "params");
const validateAdminCreate = validate(adminCreateUserSchema, "body");
const validateAdminUpdate = validate(adminUpdateUserSchema, "body");

route.get(
  "/user/email",
  ...admin,
  validate(emailLookupSchema, "query"),
  getUserByEmailController,
);

// Canonical administrator user-management API.
route.get("/users", ...admin, getAllUsersController);
route.post("/users", ...admin, validateAdminCreate, addNewUserController);
route.get("/users/:id", ...admin, validateUserId, getUserByIdController);
route.patch("/users/:id", ...admin, validateUserId, validateAdminUpdate, updateUserController);
route.patch(
  "/users/:id/password",
  ...admin,
  validateUserId,
  validate(adminPasswordUpdateSchema, "body"),
  updateUserPasswordController,
);
route.delete("/users/:id", ...admin, validateUserId, deleteUserController);

// Protected compatibility routes for the existing administrator UI.
route.get("/user/:id", ...admin, validateUserId, getUserByIdController);
route.post("/user/add", ...admin, validateAdminCreate, addNewUserController);
route.put("/user/update/:id", ...admin, validateUserId, validateAdminUpdate, updateUserController);
route.delete("/user/delete/:id", ...admin, validateUserId, deleteUserController);
route.patch(
  "/user/status/:id",
  ...admin,
  validateUserId,
  validate(userStatusSchema, "body"),
  updateUserStatusController,
);

export default route;
