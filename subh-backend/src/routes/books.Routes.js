import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createBookController,
  getAllBooksController,
} from "../controller/books.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import { createBookSchema } from "../validation/books.Validation.js";

const route = express.Router();

route.get("/books", getAllBooksController);
route.post(
  "/book/create",
  protect,
  adminOnly,
  validate(createBookSchema),
  createBookController,
);
export default route;
