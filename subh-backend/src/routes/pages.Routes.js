import express from "express";
import {
  createPageController,
  deletePageController,
  getAllPagesController,
  getPageBySlugController,
  updatePageController,
} from "../controller/pages.Controller.js";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
const router = express.Router();

router.post("/page", protect, adminOnly, createPageController);
router.get("/pages", protect, getAllPagesController);
router.get("/page/:slug", protect, adminOnly, getPageBySlugController);
router.put("/page/:id", protect, adminOnly, updatePageController);
router.delete("/page/:id", protect, adminOnly, deletePageController);

export default router;
