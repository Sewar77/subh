import express from "express";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validation/auth.Validation.js";
import {
  loginUserController,
  registerUserController,
} from "../controller/auth.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";

const route = express.Router();

route.post(
  "/auth/register",
  validate(registerUserSchema),
  registerUserController,
);
route.post("/auth/login", validate(loginUserSchema), loginUserController);

export default route;
