import formatError from "../helper/formatError.js";
import {
  createPage,
  deletePage,
  getAllPages,
  getPageById,
  updatePage,
} from "../models/pages.Models.js";

/**
 * CREATE PAGE
 */
export const createPageController = async (req, res) => {
  try {
    const { template_id, key } = req.body;

    const page = await createPage(template_id, key);

    if (!page) {
      return res.status(400).json({
        message: "Failed to create page",
      });
    }
    return res.status(201).json({
      message: "Page created successfully",
      page,
    });
  } catch (error) {
    return res.status(500).json({
      message: formatError(error),
    });
  }
};

/**
 * GET ALL PAGES
 */
export const getAllPagesController = async (req, res) => {
  try {
    const pages = await getAllPages();

    if (!pages.length) {
      return res.status(200).json({
        message: "No pages found",
        pages: [],
      });
    }

    return res.status(200).json({
      pages,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching pages",
    });
  }
};

/**
 * GET PAGE BY ID
 */
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
      message: "Server error while fetching page",
    });
  }
};

/**
 * UPDATE PAGE
 */
export const updatePageController = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, template_id } = req.body;

    const page = await updatePage(key, template_id, id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found or not updated",
      });
    }

    return res.status(200).json({
      message: "Page updated successfully",
      page,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating page",
    });
  }
};

/**
 * DELETE PAGE
 */
export const deletePageController = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);

    const page = await deletePage(id);
    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json({
      message: "Page deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting page",
    });
  }
};
