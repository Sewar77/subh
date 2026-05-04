import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
} from "../controller/categories.Controller.js";
const route = express.Router();

route.post("/categories/create", protect, adminOnly, createCategoryController);
route.get("/categories/all", getAllCategoriesController);
route.delete(
  "/category/delete/:id",
  protect,
  adminOnly,
  deleteCategoryController,
);
route.get("/category/:id", protect, getCategoryByIdController);
route.put("/category/update/:id", protect, adminOnly, updateCategoryController);
export default route;
