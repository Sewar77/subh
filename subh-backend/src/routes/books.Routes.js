import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createBookController,
  deleteBookController,
  getAllBooksController,
  getBookByIdController,
  updateBookByIdController,
} from "../controller/books.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  bookIdParamSchema,
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
route.post(
  "/books",
  protect,
  adminOnly,
  validate(createBookSchema, "body"),
  createBookController,
);
route.patch(
  "/books/:id",
  validate(bookIdParamSchema, "params"),
  protect,
  adminOnly,
  validate(updateBookSchema, "body"),
  updateBookByIdController,
);
route.delete(
  "/books/:id",
  validate(bookIdParamSchema, "params"),
  protect,
  adminOnly,
  deleteBookController,
);

route.get(
  "/book/:id",
  validate(bookIdParamSchema, "params"),
  getBookByIdController,
);
route.post(
  "/book/create",
  protect,
  adminOnly,
  validate(createBookSchema, "body"),
  createBookController,
);
route.put(
  "/book/update/:id",
  validate(bookIdParamSchema, "params"),
  protect,
  adminOnly,
  validate(updateBookSchema, "body"),
  updateBookByIdController,
);
route.delete(
  "/book/:id",
  validate(bookIdParamSchema, "params"),
  protect,
  adminOnly,
  deleteBookController,
);

export default route;
