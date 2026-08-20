import cloudinary from "../../config/cloudinary.js";

export const uploadToCloudinary = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    unique_filename: true,
    overwrite: false,
    quality: "auto",
    fetch_format: "auto",
  });
};

export const destroyCloudinaryAsset = async (publicId) => {
  if (!publicId || typeof publicId !== "string") return null;
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
};
