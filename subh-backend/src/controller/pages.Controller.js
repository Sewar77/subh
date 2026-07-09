import formatError from "../helper/formatError.js";

import {
  createPage,
  deletePage,
  getAllPages,
  getPageById,
  getPageByKeyModel,
  updatePage,
} from "../models/pages.Models.js";

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
     (error);

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
    const { id } = req.params;

    const page = await getPageById(id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json({
      page,
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
    const { key } = req.params;

    const page = await getPageByKeyModel(key);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json({
      page,
    });
  } catch (error) {
    return res.status(500).json({
      message: formatError(error),
    });
  }
};

// =========================
// UPDATE PAGE
// =========================

export const updatePageController = async (req, res) => {
  try {
    const { id } = req.params;

    const { key, name, status } = req.body;

    const page = await updatePage(id, key, name, status);

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
