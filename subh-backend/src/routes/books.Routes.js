import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createBookController,
  deleteBookController,
  getAllBooksController,
  getBookByIdController,
  getBooksByCategoryController,
  updateBookByIdController,
} from "../controller/books.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  bookIdParamSchema,
  categoryIdParamSchema,
  createBookSchema,
  listBooksQuerySchema,
  updateBookSchema,
} from "../validation/books.Validation.js";

const route = express.Router();

route.get(
  "/books",
  validate(listBooksQuerySchema, "query"),
  getAllBooksController,
);
route.get(
  "/books/:id",
  validate(bookIdParamSchema, "params"),
  getBookByIdController,
);
route.get(
  "/categories/:categoryId/books",
  validate(categoryIdParamSchema, "params"),
  getBooksByCategoryController,
);
route.post(
  "/books",
  protect,
  adminOnly,
  validate(createBookSchema, "body"),
  createBookController,
);
route.patch(
  "/books/:id",
  protect,
  adminOnly,
  validate(bookIdParamSchema, "params"),
  validate(updateBookSchema, "body"),
  updateBookByIdController,
);
route.delete(
  "/books/:id",
  protect,
  adminOnly,
  validate(bookIdParamSchema, "params"),
  deleteBookController,
);

export default route;
