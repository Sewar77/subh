import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createBookController,
  deleteBookController,
  getAllBooksController,
  getBookByIdController,
  getBooksByCategoryController,
  getPublicBooksController,
  getPublicBookByIdController,
  getPublicBooksByCategoryController,
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
import { publicBooksQuerySchema, publicLocaleQuerySchema } from "../validation/publicLocale.Validation.js";

const route = express.Router();

route.get("/public/books", validate(publicBooksQuerySchema, "query"), getPublicBooksController);
route.get("/public/books/:id", validate(bookIdParamSchema, "params"), validate(publicLocaleQuerySchema, "query"), getPublicBookByIdController);
route.get("/public/categories/:categoryId/books", validate(categoryIdParamSchema, "params"), validate(publicBooksQuerySchema, "query"), getPublicBooksByCategoryController);

route.get(
  "/books",
  protect,
  adminOnly,
  validate(listBooksQuerySchema, "query"),
  getAllBooksController,
);
route.get(
  "/books/:id",
  protect,
  adminOnly,
  validate(bookIdParamSchema, "params"),
  getBookByIdController,
);
route.get(
  "/categories/:categoryId/books",
  protect,
  adminOnly,
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
