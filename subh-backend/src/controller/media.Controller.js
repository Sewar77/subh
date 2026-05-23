import {
  createMedia,
  deleteMedia,
  getAllMedia,
  getMediaById,
} from "../models/media.Models..js";
import { uploadToCloudinary } from "../services/cloudinary/cloudinaryServices.js";

export const createMediaController = async (req, res) => {
  try {
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const cloud = await uploadToCloudinary(req.file.path);

    const {
      secure_url,
      public_id,
      format,
      bytes,
      resource_type,
      width,
      height,
    } = cloud;

    const media = await createMedia({
      url: secure_url,
      public_id,
      type: resource_type,
      format,
      mime_type: req.file.mimetype,
      size_kb: bytes ? Math.round(bytes / 1024) : null,
      width,
      height,
      folder: "uploads",
      alt_text: req.body.alt_text || null,
      uploaded_by: req.user?.id || null,
    });

    return res.status(201).json(media);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
};

export const getAllMediaController = async (req, res) => {
  try {
    const media = await getAllMedia();
    return res.json(media);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch media",
      error: err.message,
    });
  }
};

export const getMediaByIdController = async (req, res) => {
  try {
    const media = await getMediaById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    return res.json(media);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching media",
      error: err.message,
    });
  }
};

export const deleteMediaController = async (req, res) => {
  try {
    const media = await deleteMedia(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    return res.json({
      message: "Deleted successfully",
      media,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Delete failed",
      error: err.message,
    });
  }
};
