import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  getPublicCategoriesController,
  getPublicCategoryByIdController,
  updateCategoryController,
} from "../controller/categories.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validation/category.Validation.js";
import { publicLocaleQuerySchema } from "../validation/publicLocale.Validation.js";

const route = express.Router();

route.get("/public/categories", validate(publicLocaleQuerySchema, "query"), getPublicCategoriesController);
route.get("/public/categories/:id", validate(categoryIdParamSchema, "params"), validate(publicLocaleQuerySchema, "query"), getPublicCategoryByIdController);

route.get("/categories", protect, adminOnly, getAllCategoriesController);
route.get(
  "/categories/:id",
  protect,
  adminOnly,
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
  protect,
  adminOnly,
  validate(categoryIdParamSchema, "params"),
  validate(updateCategorySchema, "body"),
  updateCategoryController,
);
route.delete(
  "/categories/:id",
  protect,
  adminOnly,
  validate(categoryIdParamSchema, "params"),
  deleteCategoryController,
);

export default route;
