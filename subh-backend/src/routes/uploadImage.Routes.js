import express from "express";
import upload from "../middleware/uploadImage.Middleware.js";
import { uploadImage } from "../controller/cloudinary.Controller.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);

export default router;
