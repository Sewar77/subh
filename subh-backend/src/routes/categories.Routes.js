import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createCategoryController,
  getAllCategoriesController,
} from "../controller/categories.Controller.js";
const route = express.Router();

route.post("/categories/create", protect, adminOnly, createCategoryController);
route.get("/categories/all", getAllCategoriesController);

export default route;
