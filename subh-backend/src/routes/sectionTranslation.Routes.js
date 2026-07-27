import express from "express";
import {
  getSectionTranslationsBySectionController,
  updateSectionTranslationController,
} from "../controller/sectionTranslator.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  legacyTranslationPatchSchema,
  sectionIdParamSchema,
} from "../validation/sectionContent.Validation.js";

const router = express.Router();

router.get(
  "/sections/:id/translations",
  protect,
  adminOnly,
  validate(sectionIdParamSchema, "params"),
  getSectionTranslationsBySectionController,
);
router.put(
  "/translations/:id",
  protect,
  adminOnly,
  validate(sectionIdParamSchema, "params"),
  validate(legacyTranslationPatchSchema, "body"),
  updateSectionTranslationController,
);

export default router;
