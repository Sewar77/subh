import express from "express";
import {
  getAllPagesController,
  getPageByIdController,
  getPageByKeyController,
  getPublicPageByKeyController,
} from "../controller/pages.Controller.js";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  pageKeyParamSchema,
  sectionIdParamSchema,
} from "../validation/sectionContent.Validation.js";
import { publicLocaleQuerySchema } from "../validation/publicLocale.Validation.js";

const router = express.Router();

// Fixed pages are developer-owned. No page creation, deletion, key, route, or
// status mutation endpoint is exposed to administrators.
router.get(
  "/public/pages/key/:key",
  validate(pageKeyParamSchema, "params"),
  validate(publicLocaleQuerySchema, "query"),
  getPublicPageByKeyController,
);
router.get("/pages", protect, adminOnly, getAllPagesController);
router.get(
  "/pages/:id",
  protect,
  adminOnly,
  validate(sectionIdParamSchema, "params"),
  getPageByIdController,
);
router.get(
  "/pages/key/:key",
  protect,
  adminOnly,
  validate(pageKeyParamSchema, "params"),
  getPageByKeyController,
);

export default router;
