import express from "express";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import {
  createMediaController,
  deleteMediaController,
  getAllMediaController,
  getMediaByIdController,
} from "../controller/media.Controller.js";
import upload from "../middleware/uploadImage.Middleware.js";

const route = express.Router();

route.get("/all-media", protect, adminOnly, getAllMediaController);
route.get("/media/:id", protect, adminOnly, getMediaByIdController);
route.post(
  "/media/upload",
  protect,
  adminOnly,
  upload.single("file"),
  createMediaController,
);
route.delete("/media", protect, adminOnly, deleteMediaController);

export default route;
