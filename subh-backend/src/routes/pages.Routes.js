import express from "express";
import {
  getAllPagesController,
  getPageByIdController,
  getPageByKeyController,
} from "../controller/pages.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  pageKeyParamSchema,
  sectionIdParamSchema,
} from "../validation/sectionContent.Validation.js";

const router = express.Router();

// Fixed pages are developer-owned. No page creation, deletion, key, route, or
// status mutation endpoint is exposed to administrators.
router.get("/pages", getAllPagesController);
router.get(
  "/pages/:id",
  validate(sectionIdParamSchema, "params"),
  getPageByIdController,
);
router.get(
  "/pages/key/:key",
  validate(pageKeyParamSchema, "params"),
  getPageByKeyController,
);

export default router;
