import express from "express";
import { validate } from "../middleware/validate.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import { createTranslationSchema } from "../validation/sectionTranslation.validation.js";
import {
  createSectionTranslationController,
  deleteSectionTranslationController,
  getSectionTranslationsBySectionController,
  updateSectionTranslationController,
} from "../controller/sectionTranslator.Controller.js";
const router = express.Router();
router.post(
  "/section-translations/:id",
  protect,
  adminOnly,
  validate(createTranslationSchema),
  createSectionTranslationController,
);
router.get(
  "/section-translations/section/:id",
  getSectionTranslationsBySectionController,
);
router.put(
  "/update-section/:id",
  protect,
  adminOnly,
  updateSectionTranslationController,
);
router.delete(
  "/delete-section/:id",
  protect,
  adminOnly,
  deleteSectionTranslationController,
);
export default router;
