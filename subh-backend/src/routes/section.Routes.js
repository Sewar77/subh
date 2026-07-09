import express from "express";

import {
  getAllSectionsController,
  getSectionsByPageController,
  getSectionByIdController,
} from "../controller/section.Controller.js";

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

/*
GET ONE SECTION
Admin edit
*/
router.get("/sections/:id", getSectionByIdController);

export default router;
