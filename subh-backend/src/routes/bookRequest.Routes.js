import express from "express";
import {
  createBookRequestController,
  getMyBookRequestController,
  listMyBookRequestsController,
} from "../controller/bookRequest.Controller.js";
import { protect } from "../middleware/protect.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  bookRequestDetailQuerySchema,
  bookRequestIdParamSchema,
  bookRequestListQuerySchema,
  createBookRequestSchema,
} from "../validation/bookRequest.Validation.js";

const route = express.Router();

route.post(
  "/book-requests",
  protect,
  validate(bookRequestDetailQuerySchema, "query"),
  validate(createBookRequestSchema, "body"),
  createBookRequestController,
);
route.get(
  "/book-requests",
  protect,
  validate(bookRequestListQuerySchema, "query"),
  listMyBookRequestsController,
);
route.get(
  "/book-requests/:id",
  protect,
  validate(bookRequestIdParamSchema, "params"),
  validate(bookRequestDetailQuerySchema, "query"),
  getMyBookRequestController,
);

export default route;
