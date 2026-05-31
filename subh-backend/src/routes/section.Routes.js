import express from "express";

import {
  createSectionController,
  getSectionsByPageController,
  getSectionByIdController,
  updateSectionController,
  deleteSectionController,
} from "../controller/section.Controller.js";

import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";

import {
  createSectionSchema,
  updateSectionSchema,
} from "../validation/section.Validation.js";

const router = express.Router();

/**
 * CREATE SECTION
 */
router.post(
  "/pages/:page_id/sections",
  protect,
  adminOnly,
  validate(createSectionSchema),
  createSectionController,
);

/**
 * GET SECTIONS BY PAGE (FAST RENDER)
 */
router.get(
  "/sections/page/:page_id",
  protect,
  adminOnly,
  getSectionsByPageController,
);

/**
 * GET SECTION BY ID
 */
router.get("/sections/:id", protect, adminOnly, getSectionByIdController);

/**
 * UPDATE SECTION
 */
router.put(
  "/sections/:id",
  protect,
  adminOnly,
  validate(updateSectionSchema),
  updateSectionController,
);

/**
 * DELETE SECTION
 */
router.delete("/sections/:id", protect, adminOnly, deleteSectionController);

export default router;
