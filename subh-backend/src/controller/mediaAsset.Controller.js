import { cleanupUploadedFile } from "../middleware/uploadImage.Middleware.js";
import { getValidated } from "../middleware/validate.Middleware.js";
import {
  archiveAdminMediaAsset,
  getAdminMediaAsset,
  listAdminMediaAssets,
  restoreAdminMediaAsset,
  updateAdminMediaAsset,
  uploadAndRegisterMediaAsset,
} from "../services/mediaAssets/mediaAssetService.js";

const failure = (res, error, fallback) => {
  if (error?.code === "MEDIA_ASSET_DUPLICATE") {
    return res
      .status(409)
      .json({ message: "Media asset is already registered" });
  }
  return res.status(500).json({ message: fallback });
};

export const listMediaAssetsController = async (req, res) => {
  try {
    return res
      .status(200)
      .json(await listAdminMediaAssets(getValidated(req, "query")));
  } catch (error) {
    return failure(res, error, "Media assets could not be loaded");
  }
};

export const getMediaAssetController = async (req, res) => {
  try {
    const asset = await getAdminMediaAsset(getValidated(req, "params").id);
    if (!asset)
      return res.status(404).json({ message: "Media asset not found" });
    return res.status(200).json({ asset });
  } catch (error) {
    return failure(res, error, "Media asset could not be loaded");
  }
};

export const uploadMediaAssetController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "An image file is required" });
    }
    const asset = await uploadAndRegisterMediaAsset({
      file: req.file,
      metadata: getValidated(req, "body"),
      uploaderAdminId: req.user.id,
    });
    return res.status(201).json({ message: "Media asset uploaded", asset });
  } catch (error) {
    return failure(res, error, "Media asset upload failed");
  } finally {
    await cleanupUploadedFile(req.file);
  }
};

export const updateMediaAssetController = async (req, res) => {
  try {
    const asset = await updateAdminMediaAsset(
      getValidated(req, "params").id,
      getValidated(req, "body"),
    );
    if (!asset)
      return res.status(404).json({ message: "Media asset not found" });
    return res.status(200).json({ message: "Media metadata updated", asset });
  } catch (error) {
    return failure(res, error, "Media metadata could not be updated");
  }
};

const setArchiveState = async (req, res, operation, message) => {
  try {
    const asset = await operation(getValidated(req, "params").id);
    if (!asset)
      return res.status(404).json({ message: "Media asset not found" });
    return res.status(200).json({ message, asset });
  } catch (error) {
    return failure(res, error, "Media archive state could not be updated");
  }
};

export const archiveMediaAssetController = (req, res) =>
  setArchiveState(req, res, archiveAdminMediaAsset, "Media asset archived");

export const restoreMediaAssetController = (req, res) =>
  setArchiveState(req, res, restoreAdminMediaAsset, "Media asset restored");
