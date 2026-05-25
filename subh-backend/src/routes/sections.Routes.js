import express from "express";
import {
  createSectionController,
  deleteSectionController,
  getSectionByIdController,
  getSectionsByPageController,
  updateSectionController,
} from "../controller/sections.controller.js";

import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { sectionSchema } from "../validation/section.Validation.js";
import { validate } from "../middleware/validate.Middleware.js";
const router = express.Router();

router.post(
  "/create-sections",
  protect,
  adminOnly,
  validate(sectionSchema),
  createSectionController,
);
router.put("/sections/:id", protect, adminOnly, updateSectionController);
router.get("/all-sections/:id", getSectionsByPageController);
router.get("/section/:id", protect, getSectionByIdController);
router.delete("/sections/:id", protect, adminOnly, deleteSectionController);
export default router;
