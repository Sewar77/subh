import formatError from "../helper/formatError.js";

import {
  createPage,
  deletePage,
  getAllPages,
  getAdminPageById,
  getPageByKeyModel,
  getPublicPageByKey,
  updatePage,
} from "../models/pages.Models.js";
import { listSectionsByPageId } from "../models/section.Model.js";
import { getValidated } from "../middleware/validate.Middleware.js";
import { hydrateSections } from "../services/cms/sectionReadService.js";
import {
  serializeAdminPage,
  serializePublicPage,
} from "../utils/pageSerializer.js";

// =========================
// CREATE PAGE
// =========================

export const createPageController = async (req, res) => {
  try {
    const { key, name } = req.body;

    const page = await createPage(key, name);

    return res.status(201).json({
      message: "Page created successfully",
      page,
    });
  } catch (error) {
    error;

    return res.status(500).json({
      message: formatError(error),
    });
  }
};

// =========================
// GET ALL PAGES
// =========================

export const getAllPagesController = async (req, res) => {
  try {
    const pages = await getAllPages();

    return res.status(200).json({
      pages,
    });
  } catch (error) {
    return res.status(500).json({
      message: formatError(error),
    });
  }
};

// =========================
// GET PAGE BY ID
// =========================

export const getPageByIdController = async (req, res) => {
  try {
    const { id } = getValidated(req, "params");

    const result = await getAdminPageById(id);

    if (!result) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json({
      ...serializeAdminPage(
        result.page,
        await hydrateSections(result.sections, { admin: true }),
      ),
    });
  } catch (error) {
    return res.status(500).json({
      message: formatError(error),
    });
  }
};

// =========================
// GET PAGE BY KEY
// =========================

export const getPageByKeyController = async (req, res) => {
  try {
    const { key } = getValidated(req, "params");

    const page = await getPageByKeyModel(key);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    const sections = await hydrateSections(
      await listSectionsByPageId(page.id),
      { admin: true },
    );
    return res.status(200).json(serializeAdminPage(page, sections));
  } catch (error) {
    return res.status(500).json({
      message: formatError(error),
    });
  }
};

export const getPublicPageByKeyController = async (req, res) => {
  try {
    const { key } = getValidated(req, "params");
    const { lang } = getValidated(req, "query");
    const result = await getPublicPageByKey(key);
    if (!result) return res.status(404).json({ message: "Page not found" });
    const sections = await hydrateSections(result.sections, { locale: lang });
    return res.status(200).json(serializePublicPage(result.page, sections));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch page" });
  }
};

// =========================
// UPDATE PAGE
// =========================

export const updatePageController = async (req, res) => {
  try {
    const { id } = req.params;

    const { key, name, status } = req.body;

    const page = await updatePage(id, key, status, name);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json({
      message: "Page updated",
      page,
    });
  } catch (error) {
    return res.status(500).json({
      message: formatError(error),
    });
  }
};

// =========================
// DELETE PAGE
// =========================

export const deletePageController = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await deletePage(id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json({
      message: "Page deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: formatError(error),
    });
  }
};
