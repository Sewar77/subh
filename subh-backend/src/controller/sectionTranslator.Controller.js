import { SectionTranslationModel } from "../models/sectionTranlsation.Model.js";

export const getSectionTranslationsBySectionController = async (req, res) => {
  try {
    const translations = await SectionTranslationModel.getBySectionId(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      translations,
    });
  } catch (error) {
    console.error(error);

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

    return res.status(200).json({
      success: true,
      translation: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
