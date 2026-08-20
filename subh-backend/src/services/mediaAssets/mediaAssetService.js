import {
  archiveMediaAsset,
  createUploadedMediaAsset,
  getMediaAssetById,
  listMediaAssets,
  restoreMediaAsset,
  updateMediaAssetMetadata,
} from "../../models/mediaAsset.Model.js";
import {
  destroyCloudinaryAsset,
  uploadToCloudinary,
} from "../cloudinary/cloudinaryServices.js";
import {
  serializeMediaAsset,
  serializeMediaAssetList,
} from "../../utils/mediaAssetSerializer.js";

const defaultDependencies = {
  archiveMediaAsset,
  createUploadedMediaAsset,
  destroyCloudinaryAsset,
  getMediaAssetById,
  listMediaAssets,
  restoreMediaAsset,
  updateMediaAssetMetadata,
  uploadToCloudinary,
};

const mediaError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const safeOriginalFilename = (value) => {
  const filename = String(value || "upload")
    .split(/[\\/]/)
    .pop()
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  return (filename || "upload").slice(0, 255);
};

const positiveIntegerOrNull = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

const nonnegativeIntegerOrNull = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
};

export const uploadAndRegisterMediaAsset = async (
  { file, metadata = {}, uploaderAdminId },
  overrides = {},
) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  const cloudinaryResult = await dependencies.uploadToCloudinary(file.path);
  const secureUrl = String(cloudinaryResult?.secure_url || "").trim();
  const publicId = String(cloudinaryResult?.public_id || "").trim();
  if (!secureUrl.startsWith("https://") || !publicId) {
    if (publicId) {
      await dependencies.destroyCloudinaryAsset(publicId).catch(() => {});
    }
    throw mediaError(
      "Cloudinary returned incomplete asset metadata",
      "MEDIA_ASSET_PROVIDER_INVALID",
    );
  }

  try {
    const originalFilename = safeOriginalFilename(file.originalname);
    const asset = await dependencies.createUploadedMediaAsset({
      secureUrl,
      publicId,
      originalFilename,
      displayName: metadata.displayName ?? originalFilename,
      mimeType: file.mimetype,
      format: cloudinaryResult.format || null,
      width: positiveIntegerOrNull(cloudinaryResult.width),
      height: positiveIntegerOrNull(cloudinaryResult.height),
      bytes: nonnegativeIntegerOrNull(cloudinaryResult.bytes),
      altTextEn: metadata.altTextEn ?? null,
      altTextAr: metadata.altTextAr ?? null,
      uploadedByAdminId: uploaderAdminId,
    });
    if (!asset) {
      throw mediaError(
        "Media asset registration returned no record",
        "MEDIA_ASSET_REGISTRATION_FAILED",
      );
    }
    return serializeMediaAsset(asset);
  } catch (error) {
    let cleanupFailed = false;
    try {
      await dependencies.destroyCloudinaryAsset(publicId);
    } catch {
      cleanupFailed = true;
    }
    if (cleanupFailed) {
      throw mediaError(
        "Media registration failed and provider cleanup was unsuccessful",
        "MEDIA_ASSET_CLEANUP_FAILED",
      );
    }
    if (error?.code === "23505") {
      throw mediaError("Media asset is already registered", "MEDIA_ASSET_DUPLICATE");
    }
    throw error;
  }
};

export const listAdminMediaAssets = async (query, overrides = {}) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  const result = await dependencies.listMediaAssets(query);
  return {
    assets: serializeMediaAssetList(result.assets),
    pagination: result.pagination,
  };
};

export const getAdminMediaAsset = async (id, overrides = {}) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  return serializeMediaAsset(await dependencies.getMediaAssetById(id));
};

export const updateAdminMediaAsset = async (id, metadata, overrides = {}) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  return serializeMediaAsset(
    await dependencies.updateMediaAssetMetadata(id, metadata),
  );
};

export const archiveAdminMediaAsset = async (id, overrides = {}) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  return serializeMediaAsset(await dependencies.archiveMediaAsset(id));
};

export const restoreAdminMediaAsset = async (id, overrides = {}) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  return serializeMediaAsset(await dependencies.restoreMediaAsset(id));
};
