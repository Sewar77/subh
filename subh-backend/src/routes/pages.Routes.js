import express from "express";

import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  deletePageByIdController,
  getAllPagesController,
  getPageByIdController,
  getPageByKeyController,
  insertPageController,
} from "../controller/pages.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import { pagesSchema } from "../validation/pages.Validation.js";
const router = express.Router();
router.post(
  "/page",
  protect,
  adminOnly,
  validate(pagesSchema),
  insertPageController,
);
router.get("/pages", getAllPagesController);
router.get("/page-id/:id", getPageByIdController);
router.get("/page-key/:key", getPageByKeyController);
router.delete("/page/:id", protect, adminOnly, deletePageByIdController);
export default router;
