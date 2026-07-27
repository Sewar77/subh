import express from "express";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validation/auth.Validation.js";
import {
  currentUser,
  loginUserController,
  logout,
  registerUserController,
} from "../controller/auth.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";

const route = express.Router();

route.post(
  "/auth/register",
  validate(registerUserSchema, "body"),
  registerUserController,
);
route.post(
  "/auth/login",
  validate(loginUserSchema, "body"),
  loginUserController,
);
route.get("/auth/me", protect, currentUser);
route.post("/auth/logout", logout);

export default route;
