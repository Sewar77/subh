import { uploadToCloudinary } from "../services/cloudinary/cloudinaryServices.js";
import { cleanupUploadedFile } from "../middleware/uploadImage.Middleware.js";
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file Uploaded",
      });
    }

    const result = await uploadToCloudinary(req.file.path);

    return res.status(200).json({
      message: "Upload successful",
      url: result.secure_url,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Upload failed",
    });
  } finally {
    await cleanupUploadedFile(req.file);
  }
};
