import Joi from "joi";

export const pagesSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-z0-9-]{2,150}$/)
    .required(),

  status: Joi.string().valid("draft", "published", "archived").default("draft"),

  default_locale: Joi.string()
    .pattern(/^[a-z]{2}$/)
    .default("en"),

  created_by: Joi.number().integer().positive().optional(),

  updated_by: Joi.number().integer().positive().optional(),
}).unknown(false);
