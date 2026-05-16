import Joi from "joi";

const arabicRegex = /^[\u0600-\u06FF0-9\s\-.,()]+$/;

export const createBookSchema = Joi.object({
  name_en: Joi.string().min(2).max(255).required().messages({
    "string.empty": "English name is required",
    "string.min": "English name must be at least 2 characters",
    "string.max": "English name is too long",
  }),

  name_ar: Joi.string()
    .pattern(arabicRegex)
    .min(2)
    .max(255)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Arabic name must contain only Arabic letters, numbers, and allowed symbols",
      "string.min": "Arabic name is too short",
      "string.max": "Arabic name is too long",
    }),

  description_en: Joi.string().allow("", null),

  description_ar: Joi.string().pattern(arabicRegex).allow("", null).messages({
    "string.pattern.base": "Arabic description must contain only Arabic text",
  }),

  weight_kg: Joi.number().positive().required().messages({
    "number.base": "Weight must be a number",
    "number.positive": "Weight must be greater than 0",
    "any.required": "Weight is required",
  }),

  author_name_en: Joi.string().allow("", null),

  author_name_ar: Joi.string().pattern(arabicRegex).allow("", null).messages({
    "string.pattern.base": "Arabic author name must contain only Arabic text",
  }),

  barcode_image: Joi.string().uri().required().messages({
    "string.uri": "Barcode image must be a valid URL",
    "any.required": "Barcode image is required",
  }),

  cover_image: Joi.string().uri().required().messages({
    "string.uri": "Cover image must be a valid URL",
    "any.required": "Cover image is required",
  }),

  category_id: Joi.number().integer().positive().allow(null),

  price: Joi.number().positive().required().messages({
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required",
  }),

  shipping_cost: Joi.number().min(0).allow(null),

  length_cm: Joi.number().positive().allow(null),

  width_cm: Joi.number().positive().allow(null),

  height_cm: Joi.number().positive().allow(null),
});
