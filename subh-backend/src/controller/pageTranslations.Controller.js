import {
  createPageTranslation,
  getPageTranslationBySlug,
  getPageTranslationsByPageId,
} from "../models/pageTranslations.Models.js";

export const createPageTranslationController = async (req, res) => {
  try {
    const { pageId, slug, locale, title, seo_title, seo_description } =
      req.body;

    const newTranslation = await createPageTranslation({
      pageId,
      slug,
      locale,
      title,
      seo_title,
      seo_description,
    });

    return res.status(201).json({
      message: "Translation created successfully",
      pageTranslation: newTranslation,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getPageTranslationsByPageIdController = async (req, res) => {
  try {
    const { pageId } = req.params;

    const translations = await getPageTranslationsByPageId(pageId);

    return res.status(200).json({
      message: "Fetched successfully",
      pageTranslations: translations,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getPageTranslationBySlugController = async (req, res) => {
  try {
    const { slug, locale } = req.params;

    if (!slug || !locale) {
      return res.status(400).json({
        message: "slug and locale are required",
      });
    }

    const pageTranslation = await getPageTranslationBySlug(slug, locale);

    if (!pageTranslation) {
      return res.status(404).json({
        message: "Page translation not found",
      });
    }

    return res.status(200).json({
      message: "Fetched successfully",
      pageTranslation,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
