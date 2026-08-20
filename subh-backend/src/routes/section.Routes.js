import express from "express";
import {
  archiveSectionController,
  createSectionController,
  duplicateSectionController,
  getAllSectionsController,
  getSectionByIdController,
  getSectionTemplatesController,
  getSectionsByPageController,
  getSectionsByPageKeyController,
  reorderPageSectionsController,
  restoreSectionController,
  toggleSectionVisibilityController,
  updateSectionVisibilityController,
  updateSectionAppearanceController,
} from "../controller/section.Controller.js";
import {
  getSectionContentController,
  patchSectionContentController,
} from "../controller/sectionContent.Controller.js";
import {
  createSectionMediaController,
  deleteSectionMediaController,
  listSectionMediaController,
  reorderSectionMediaController,
  updateSectionMediaController,
} from "../controller/sectionMedia.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  pageIdParamSchema,
  pageKeyParamSchema,
  pageSectionsParamSchema,
  sectionContentPatchSchema,
  sectionIdParamSchema,
  sectionReorderSchema,
  sectionVisibilitySchema,
} from "../validation/sectionContent.Validation.js";
import {
  sectionAppearancePatchSchema,
  sectionCreateSchema,
  sectionDuplicateSchema,
} from "../validation/sectionManagement.Validation.js";
import {
  sectionMediaCreateSchema,
  sectionMediaParamSchema,
  sectionMediaReorderSchema,
  sectionMediaUpdateSchema,
} from "../validation/sectionMedia.Validation.js";
import { publicLocaleQuerySchema } from "../validation/publicLocale.Validation.js";

const router = express.Router();
const admin = [protect, adminOnly];

router.get(
  "/pages/:page_id/sections",
  ...admin,
  validate(pageSectionsParamSchema, "params"),
  validate(publicLocaleQuerySchema, "query"),
  getSectionsByPageController,
);
router.get(
  "/pages/sections/:key",
  ...admin,
  validate(pageKeyParamSchema, "params"),
  validate(publicLocaleQuerySchema, "query"),
  getSectionsByPageKeyController,
);

router.get("/cms/section-templates", ...admin, getSectionTemplatesController);
router.get("/sections", ...admin, getAllSectionsController);
router.post(
  "/pages/:pageId/sections",
  ...admin,
  validate(pageIdParamSchema, "params"),
  validate(sectionCreateSchema, "body"),
  createSectionController,
);
router.post(
  "/sections/:id/duplicate",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  validate(sectionDuplicateSchema, "body"),
  duplicateSectionController,
);
router.get(
  "/sections/:id",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  getSectionByIdController,
);
router.get(
  "/sections/:id/content",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  getSectionContentController,
);
router.patch(
  "/sections/:id/content",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  validate(sectionContentPatchSchema, "body"),
  patchSectionContentController,
);
router.patch(
  "/sections/:id/appearance",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  validate(sectionAppearancePatchSchema, "body"),
  updateSectionAppearanceController,
);

router.get(
  "/sections/:id/media",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  listSectionMediaController,
);
router.post(
  "/sections/:id/media",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  validate(sectionMediaCreateSchema, "body"),
  createSectionMediaController,
);
router.patch(
  "/sections/:id/media/reorder",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  validate(sectionMediaReorderSchema, "body"),
  reorderSectionMediaController,
);
router.patch(
  "/sections/:id/media/:mediaId",
  ...admin,
  validate(sectionMediaParamSchema, "params"),
  validate(sectionMediaUpdateSchema, "body"),
  updateSectionMediaController,
);
router.delete(
  "/sections/:id/media/:mediaId",
  ...admin,
  validate(sectionMediaParamSchema, "params"),
  deleteSectionMediaController,
);

router.patch(
  "/pages/:pageId/sections/reorder",
  ...admin,
  validate(pageIdParamSchema, "params"),
  validate(sectionReorderSchema, "body"),
  reorderPageSectionsController,
);
router.patch(
  "/sections/:id/visibility",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  validate(sectionVisibilitySchema, "body"),
  updateSectionVisibilityController,
);
router.patch(
  "/sections/:id/toggle",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  toggleSectionVisibilityController,
);
router.patch(
  "/sections/:id/archive",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  archiveSectionController,
);
router.patch(
  "/sections/:id/restore",
  ...admin,
  validate(sectionIdParamSchema, "params"),
  restoreSectionController,
);

export default router;
