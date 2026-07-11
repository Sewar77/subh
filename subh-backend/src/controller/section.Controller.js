import {
  getSectionsByPage,
  getSectionById,
  getAllSections,
  toggleSectionVisibility,
  getSectionsByPageKey,
} from "../models/section.Model.js";

/**
 * GET ALL SECTIONS
 * Admin dashboard
 */
export const getAllSectionsController = async (req, res) => {
  try {
    const sections = await getAllSections();

    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch sections",
    });
  }
};

/**
 * GET SECTIONS BY PAGE
 * Frontend rendering
 */
export const getSectionsByPageController = async (req, res) => {
  try {
    const { page_id } = req.params;

    const sections = await getSectionsByPage(page_id);

    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch page sections",
    });
  }
};

/**
 * GET SECTIONS BY PAGE
 * Frontend rendering
 */
export const getSectionsByPageKeyController = async (req, res) => {
  try {
    const key = req.params.key;
    console.log(key);

    const sections = await getSectionsByPageKey(key);

    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch page sections",
    });
  }
};

/**
 * GET SINGLE SECTION
 * Admin editing page
 */
export const getSectionByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await getSectionById(id);

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    return res.status(200).json({
      success: true,
      section,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch section",
    });
  }
};

export const toggleSectionVisibilityController = async (req, res) => {
  try {
    const section = await toggleSectionVisibility(req.params.id);
    ("yes");

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    return res.json({
      success: true,
      section,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
