import {
  createPageTranslation,
  deletePageTranslation,
  getAllPageTranslations,
  getPageTranslation,
  getPageTranslationById,
  updatePageTranslation,
} from "../models/pagesTranslations.Models.js";

/**
 * CREATE
 */
export const createPageTranslationController = async (req, res) => {
  try {
    const { page_id, locale, title, slug, seo_title, seo_description } =
      req.body;

    const result = await createPageTranslation(
      page_id,
      locale,
      title,
      slug,
      seo_title,
      seo_description,
    );

    if (!result) {
      return res.status(400).json({ message: "Failed to create translation" });
    }

    return res.status(201).json({
      message: "Translation created",
      translation: result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET ALL
 */
export const getAllPageTranslationsController = async (req, res) => {
  try {
    const result = await getAllPageTranslations();

    return res.status(200).json({
      translations: result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET BY ID
 */
export const getPageTranslationByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getPageTranslationById(id);

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({
      translation: result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET BY PAGE + LOCALE (IMPORTANT FOR CMS RENDER)
 */
export const getPageTranslationController = async (req, res) => {
  try {
    const { page_id, locale } = req.query;

    const result = await getPageTranslation(page_id, locale);

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({
      translation: result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE
 */
export const updatePageTranslationController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, seo_title, seo_description } = req.body;

    const result = await updatePageTranslation(
      id,
      title,
      slug,
      seo_title,
      seo_description,
    );

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({
      message: "Updated",
      translation: result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE
 */
export const deletePageTranslationController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deletePageTranslation(id);

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({
      message: "Deleted",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
