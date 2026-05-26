import express from "express";
import {
  createPageTranslationController,
  getAllPageTranslationsController,
  getPageTranslationByIdController,
  getPageTranslationController,
  updatePageTranslationController,
  deletePageTranslationController,
} from "../controller/pageTranslations.controller.js";

import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  createPageTranslationSchema,
  updatePageTranslationSchema,
} from "../validation/pageTranslations.validation.js";

const router = express.Router();

/**
 * CREATE
 */
router.post(
  "/page-translations",
  protect,
  adminOnly,
  validate(createPageTranslationSchema),
  createPageTranslationController,
);

/**
 * GET ALL
 */
router.get(
  "/page-translations",
  protect,
  adminOnly,
  getAllPageTranslationsController,
);

/**
 * GET BY ID
 */
router.get(
  "/page-translations/:id",
  protect,
  adminOnly,
  getPageTranslationByIdController,
);

/**
 * GET BY PAGE + LOCALE (CMS RENDER ENDPOINT)
 */
router.get(
  "/page-translation",
  protect,
  adminOnly,
  getPageTranslationController,
);

/**
 * UPDATE
 */
router.put(
  "/page-translations/:id",
  protect,
  adminOnly,
  validate(updatePageTranslationSchema),
  updatePageTranslationController,
);

/**
 * DELETE
 */
router.delete(
  "/page-translations/:id",
  protect,
  adminOnly,
  deletePageTranslationController,
);

export default router;
