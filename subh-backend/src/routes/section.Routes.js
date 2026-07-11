import express from "express";

import {
  getAllSectionsController,
  getSectionsByPageController,
  getSectionByIdController,
  toggleSectionVisibilityController,
  getSectionsByPageKeyController,
} from "../controller/section.Controller.js";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
const router = express.Router();

/*
GET ALL SECTIONS
Admin dashboard
*/
router.get("/sections", getAllSectionsController);

/*
GET PAGE SECTIONS
Frontend
*/
router.get("/pages/:page_id/sections", getSectionsByPageController);
router.get("/pages/sections/:key", getSectionsByPageKeyController);

/*
GET ONE SECTION
Admin edit
*/
router.get("/sections/:id", getSectionByIdController);
router.patch(
  "/sections/:id/toggle",
  protect,
  adminOnly,
  toggleSectionVisibilityController,
);
export default router;
