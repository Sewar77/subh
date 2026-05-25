import {
  createSection,
  deleteSection,
  getAllSectionsByPage,
  getSectionById,
  updateSection,
} from "../models/sections.Model.js";

export const createSectionController = async (req, res) => {
  try {
    const { pageId, type, settings = {} } = req.body;
    if (!pageId || !type) {
      return res.status(400).json({
        message: "pageId and type are required",
      });
    }
    const section = await createSection(pageId, type, settings);
    return res.status(201).json({
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const getSectionsByPageController = async (req, res) => {
  try {
    const pageId = req.params.id;
    if (!pageId) {
      return res.status(400).json({
        message: "pageId is required",
      });
    }
    const sections = await getAllSectionsByPage(pageId);
    return res.status(200).json({
      message: "Sections fetched successfully",
      sections,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteSectionController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Section id is required",
      });
    }

    await deleteSection(id);

    return res.status(200).json({
      message: "Section deleted and positions updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateSectionController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { type, settings, is_visible } = req.body;

    const updatedSection = await updateSection(id, {
      type,
      settings,
      is_visible,
      userId,
    });

    if (!updatedSection) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    return res.status(200).json({
      message: "Section updated successfully",
      section: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getSectionByIdController = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const section = await getSectionById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    return res.status(200).json({ message: "section fetsched", section });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
