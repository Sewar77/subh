import express from "express";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import {
  getSectionTranslationsBySectionController,
  updateSectionTranslationController,
} from "../controller/sectionTranslator.Controller.js";

const router = express.Router();

router.get(
  "/sections/:id/translations",
  getSectionTranslationsBySectionController,
);

router.put(
  "/translations/:id",
  protect,
  adminOnly,
  updateSectionTranslationController,
);

export default router;
