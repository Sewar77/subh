import Joi from "joi";

export const pageTranslationSchema = Joi.object({
  pageId: Joi.number().integer().positive().required(),
  locale: Joi.string().valid("en", "ar").required(),
  title: Joi.string().min(2).max(255).required(),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(255)
    .required(),
  seo_title: Joi.string().max(255).allow("", null),
  seo_description: Joi.string().max(1000).allow("", null),
  content: Joi.object().optional(),
});
