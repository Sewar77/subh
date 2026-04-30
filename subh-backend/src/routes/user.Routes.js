import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import {
  getAllUsersController,
  getUserByEmailController,
  getUserByIdController,
} from "../controller/user.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
const route = express.Router();

route.get("/user/email", protect, getUserByEmailController);
route.get("/users", protect, adminOnly, getAllUsersController);
route.get("/user/:id", protect, getUserByIdController);

export default route;
