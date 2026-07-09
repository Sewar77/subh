import { SectionTranslationModel } from "../models/sectionTranlsation.Model.js";

export const createSectionTranslationController = async (req, res) => {
  try {
    const section_id = req.params.id;

    const { locale, title, content } = req.body;

    const translation = await SectionTranslationModel.create({
      section_id,
      locale,
      title,
      content,
    });

    return res.status(201).json({
      success: true,
      translation,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Translation already exists for this language",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSectionTranslationsBySectionController = async (req, res) => {
  try {
    const translations = await SectionTranslationModel.getBySectionId(
      req.params.id,
    );

    return res.json({
      success: true,
      translations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateSectionTranslationController = async (req, res) => {
  try {
    const updated = await SectionTranslationModel.update(
      req.params.id,
      req.body,
    );

    if (!updated) {
      return res.status(404).json({
        message: "Translation not found",
      });
    }

    return res.json({
      success: true,
      translation: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteSectionTranslationController = async (req, res) => {
  try {
    const deleted = await SectionTranslationModel.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Translation not found",
      });
    }

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};
