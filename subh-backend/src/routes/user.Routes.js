import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import {
  addNewUserController,
  deleteUserController,
  getAllUsersController,
  getUserByEmailController,
  getUserByIdController,
} from "../controller/user.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
const route = express.Router();

route.get("/user/email", protect, getUserByEmailController);
route.get("/users", protect, adminOnly, getAllUsersController);
route.get("/user/:id", protect, getUserByIdController);
route.delete("/user/delete/:id", protect, deleteUserController);
route.post("/user/add", protect, adminOnly, addNewUserController);
export default route;
