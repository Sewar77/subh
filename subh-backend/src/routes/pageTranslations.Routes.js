import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import { pageTranslationSchema } from "../validation/pageTranslations.Validation.js";
import {
  createPageTranslationController,
  getPageTranslationBySlugController,
  getPageTranslationsByPageIdController,
} from "../controller/pageTranslations.Controller.js";

const route = express.Router();

route.post(
  "/page-translations",
  protect,
  adminOnly,
  validate(pageTranslationSchema),
  createPageTranslationController,
);
route.get(
  "/page-translations/:slug/:locale",
  protect,
  adminOnly,
  getPageTranslationBySlugController,
);

route.get(
  "/page-translations/:id",
  protect,
  adminOnly,
  getPageTranslationsByPageIdController,
);
export default route;
