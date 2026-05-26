import Joi from "joi";

export const createPageTranslationSchema = Joi.object({
  page_id: Joi.number().integer().required().messages({
    "number.base": "page_id must be a number",
    "any.required": "page_id is required",
  }),

  locale: Joi.string().length(2).required().messages({
    "string.base": "locale must be a string",
    "string.length": "locale must be 2 characters (en/ar)",
    "any.required": "locale is required",
  }),

  title: Joi.string().min(2).max(255).required(),

  slug: Joi.string().min(2).max(255).required(),

  seo_title: Joi.string().allow("", null),

  seo_description: Joi.string().allow("", null),
});

export const updatePageTranslationSchema = Joi.object({
  title: Joi.string().min(2).max(255).optional(),

  slug: Joi.string().min(2).max(255).optional(),

  seo_title: Joi.string().allow("", null).optional(),

  seo_description: Joi.string().allow("", null).optional(),
});
