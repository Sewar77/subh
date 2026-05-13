import Joi from "joi";

const arabicRegex = /^[\u0600-\u06FF0-9\s\-.,()]+$/;

export const createBookSchema = Joi.object({
  name_en: Joi.string().min(2).max(255).required(),

  name_ar: Joi.string().pattern(arabicRegex).min(2).max(255).allow(null, ""),

  description_en: Joi.string().allow("", null),

  description_ar: Joi.string().pattern(arabicRegex).allow("", null),
  weight_kg: Joi.number().positive().required(),
  author_name_en: Joi.string().allow("", null),
  author_name_ar: Joi.string().pattern(arabicRegex).allow("", null),
  barcode_image: Joi.string().uri().required(),
  cover_image: Joi.string().uri().required(),

  category_id: Joi.number().integer().positive().allow(null),

  price: Joi.number().positive().required(),

  shipping_cost: Joi.number().min(0).allow(null),

  length_cm: Joi.number().positive().allow(null),

  width_cm: Joi.number().positive().allow(null),

  height_cm: Joi.number().positive().allow(null),
});
