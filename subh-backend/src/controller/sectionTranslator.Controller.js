import { SectionTranslationModel } from "../models/sectionTranlsation.Model.js";
/*
  CREATE
 */
export const createSectionTranslationController = async (req, res) => {
  try {
    const section_id = req.params.id;
    const { locale, title, content } = req.body;
    const section_translation = await SectionTranslationModel.create({
      section_id,
      locale,
      title,
      content,
    });
    return res.status(201).json({
      success: true,
      message: "Section translation created",
      section_translation,
    });
  } catch (error) {
    console.error("Create Translation Error: ", error);
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: `Translation for locale "${req.body.locale}" already exists`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
/**
 GET BY SECTION
 */
export const getSectionTranslationsBySectionController = async (req, res) => {
  try {
    const section_id = req.params.id;
    const translations =
      await SectionTranslationModel.getBySectionId(section_id);
    return res.status(200).json({
      success: true,
      message: "Translations fetched successfully",
      translations,
    });
  } catch (error) {
    console.error("Get Translations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
/*
  UPDATE
 */
export const updateSectionTranslationController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, is_visible } = req.body;
    const updated = await SectionTranslationModel.update(id, {
      title,
      content,
      is_visible,
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      section_translation: updated,
    });
  } catch (error) {
    console.error("Update Translation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
/**
  DELETE
 */
export const deleteSectionTranslationController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SectionTranslationModel.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Delete Translation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
