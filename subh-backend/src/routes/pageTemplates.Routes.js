import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createPageTemplatesController,
  deletePageTemplateController,
  getAllPageTemplatesController,
  getPageTemplatesByIdController,
  updatePageTemplatesController,
} from "../controller/pageTemplates.Controller.js";
import { validate } from "../middleware/validate.Middleware.js";
import { pagesSchema } from "../validation/pageTemplates.Validation.js";
const route = express.Router();
route.post(
  "/page-templates",
  protect,
  adminOnly,
  validate(pagesSchema),
  createPageTemplatesController,
);
route.get(
  "/all-page-templates",
  protect,
  adminOnly,
  getAllPageTemplatesController,
);
route.get(
  "/page-templates/:id",
  protect,
  adminOnly,
  getPageTemplatesByIdController,
);
route.put(
  "/page-templates/:id",
  protect,
  adminOnly,
  updatePageTemplatesController,
);
route.delete(
  "/page-templates/:id",
  protect,
  adminOnly,
  deletePageTemplateController,
);
export default route;
