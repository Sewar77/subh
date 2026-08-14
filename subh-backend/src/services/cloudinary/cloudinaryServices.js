import cloudinary from "../../config/cloudinary.js";

export const uploadToCloudinary = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    quality: "auto",
    fetch_format: "auto",
  });
};
