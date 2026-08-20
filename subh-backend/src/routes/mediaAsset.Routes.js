import express from "express";
import {
  archiveMediaAssetController,
  getMediaAssetController,
  listMediaAssetsController,
  restoreMediaAssetController,
  updateMediaAssetController,
  uploadMediaAssetController,
} from "../controller/mediaAsset.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { uploadRateLimit } from "../middleware/rateLimit.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import upload, {
  verifyUploadedImage,
} from "../middleware/uploadImage.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import { validateMultipartBody } from "../middleware/validateMultipart.Middleware.js";
import {
  mediaAssetIdParamSchema,
  mediaAssetEmptyBodySchema,
  mediaAssetListQuerySchema,
  mediaAssetMetadataUpdateSchema,
  mediaAssetUploadMetadataSchema,
} from "../validation/mediaAsset.Validation.js";

const router = express.Router();
const admin = [protect, adminOnly];

router.get(
  "/admin/media-assets",
  ...admin,
  validate(mediaAssetListQuerySchema, "query"),
  listMediaAssetsController,
);
router.get(
  "/admin/media-assets/:id",
  ...admin,
  validate(mediaAssetIdParamSchema, "params"),
  getMediaAssetController,
);
router.post(
  "/admin/media-assets/upload",
  ...admin,
  uploadRateLimit,
  upload.single("image"),
  verifyUploadedImage,
  validateMultipartBody(mediaAssetUploadMetadataSchema),
  uploadMediaAssetController,
);
router.patch(
  "/admin/media-assets/:id",
  ...admin,
  validate(mediaAssetIdParamSchema, "params"),
  validate(mediaAssetMetadataUpdateSchema, "body"),
  updateMediaAssetController,
);
router.patch(
  "/admin/media-assets/:id/archive",
  ...admin,
  validate(mediaAssetIdParamSchema, "params"),
  validate(mediaAssetEmptyBodySchema, "body"),
  archiveMediaAssetController,
);
router.patch(
  "/admin/media-assets/:id/restore",
  ...admin,
  validate(mediaAssetIdParamSchema, "params"),
  validate(mediaAssetEmptyBodySchema, "body"),
  restoreMediaAssetController,
);

export default router;
