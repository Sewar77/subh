import express from "express";
import upload, {
  verifyUploadedImage,
} from "../middleware/uploadImage.Middleware.js";
import { uploadImage } from "../controller/cloudinary.Controller.js";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { uploadRateLimit } from "../middleware/rateLimit.Middleware.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  adminOnly,
  uploadRateLimit,
  upload.single("image"),
  verifyUploadedImage,
  uploadImage,
);

export default router;
