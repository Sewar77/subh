import express from "express";
import {
  createPageController,
  getAllPagesController,
  getPageByIdController,
  updatePageController,
  deletePageController,
  getPageByKeyController,
} from "../controller/pages.controller.js";

import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  createPageSchema,
  updatePageSchema,
} from "../validation/pagesSchema.Validation.js";

const router = express.Router();

/**
 * CREATE PAGE
 */
router.post(
  "/pages",
  protect,
  adminOnly,
  validate(createPageSchema),
  createPageController,
);

/**
 * GET ALL PAGES
 */
router.get("/pages", getAllPagesController);

/**
 * GET PAGE BY ID
 */
router.get("/pages/:id", getPageByIdController);
router.get("/pages/key/:key", getPageByKeyController);

/**
 * UPDATE PAGE
 */
router.put(
  "/pages/:id",
  protect,
  adminOnly,
  validate(updatePageSchema),
  updatePageController,
);

/**
 * DELETE PAGE
 */
router.delete("/pages/:id", protect, adminOnly, deletePageController);

export default router;
