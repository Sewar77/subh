import {
  createSection,
  getSectionsByPage,
  getSectionById,
  updateSection,
  deleteSection,
  getAllSections,
} from "../models/section.Model.js";

export const getAllSectionsController = async (req, res) => {
  try {
    const sections = await getAllSections();

    return res.status(200).json({
      success: true,
      message: "Sections fetched successfully",
      sections,
    });
  } catch (error) {
    console.error("Get All Sections Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sections",
    });
  }
};
/**
 * CREATE
 */
export const createSectionController = async (req, res) => {
  try {
    const { page_id } = req.params;
    const { type, position } = req.body;
    const section = await createSection(page_id, type, position);

    if (!section) {
      return res.status(400).json({ message: "Failed to create section" });
    }

    return res.status(201).json({
      message: "Section created",
      section,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET BY PAGE (MAIN CMS RENDER ENDPOINT)
 */
export const getSectionsByPageController = async (req, res) => {
  try {
    const { page_id } = req.params;

    const sections = await getSectionsByPage(page_id);

    return res.status(200).json({
      sections,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET BY ID
 */
export const getSectionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await getSectionById(id);
    if (!section) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.status(200).json({
      section,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE
 */
export const updateSectionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, position, is_visible } = req.body;

    const section = await updateSection(id, type, position, is_visible);

    if (!section) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({
      message: "Updated",
      section,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE
 */
export const deleteSectionController = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await deleteSection(id);

    if (!section) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({
      message: "Deleted",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
