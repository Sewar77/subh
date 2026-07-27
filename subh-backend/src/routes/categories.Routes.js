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
import { validate } from "../middleware/validate.Middleware.js";
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validation/category.Validation.js";

const route = express.Router();

route.get("/categories", getAllCategoriesController);
route.get(
  "/categories/:id",
  validate(categoryIdParamSchema, "params"),
  getCategoryByIdController,
);
route.post(
  "/categories",
  protect,
  adminOnly,
  validate(createCategorySchema, "body"),
  createCategoryController,
);
route.patch(
  "/categories/:id",
  validate(categoryIdParamSchema, "params"),
  protect,
  adminOnly,
  validate(updateCategorySchema, "body"),
  updateCategoryController,
);
route.delete(
  "/categories/:id",
  validate(categoryIdParamSchema, "params"),
  protect,
  adminOnly,
  deleteCategoryController,
);

route.get("/categories/all", getAllCategoriesController);
route.get("/category/:id", getCategoryByIdController);
route.post(
  "/categories/create",
  protect,
  adminOnly,
  validate(createCategorySchema, "body"),
  createCategoryController,
);
route.put(
  "/category/update/:id",
  validate(categoryIdParamSchema, "params"),
  protect,
  adminOnly,
  validate(updateCategorySchema, "body"),
  updateCategoryController,
);
route.delete(
  "/category/delete/:id",
  validate(categoryIdParamSchema, "params"),
  protect,
  adminOnly,
  deleteCategoryController,
);

export default route;
