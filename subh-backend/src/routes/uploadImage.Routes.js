import express from "express";
import upload from "../middleware/uploadImage.Middleware.js";
import { uploadImage } from "../controller/cloudinary.Controller.js";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  adminOnly,
  upload.single("image"),
  uploadImage,
);

export default router;
