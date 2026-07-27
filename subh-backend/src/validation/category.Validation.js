import Joi from "joi";

const arabicRegex = /^[\u0600-\u06FF0-9\s\-.,()]+$/;
const textString = Joi.string().trim().max(255);
const optionalText = Joi.string().trim().max(1000).allow(null, "");
const imageRef = Joi.string().trim().max(500).allow(null, "");

export const createCategorySchema = Joi.object({
  nameEn: textString.min(2).required().messages({
    "string.empty": "English name is required",
    "string.min": "English name must be at least 2 characters",
    "any.required": "English name is required",
  }),
  nameAr: textString.pattern(arabicRegex).min(2).required().messages({
    "string.empty": "Arabic name is required",
    "string.pattern.base":
      "Arabic name must contain only Arabic letters, numbers, and allowed symbols",
    "string.min": "Arabic name must be at least 2 characters",
    "any.required": "Arabic name is required",
  }),
  descriptionEn: optionalText,
  descriptionAr: optionalText.pattern(arabicRegex).messages({
    "string.pattern.base": "Arabic description must contain only Arabic text",
  }),
  image: imageRef,
}).unknown(false);

export const updateCategorySchema = Joi.object({
  nameEn: textString.min(2),
  nameAr: textString.pattern(arabicRegex).min(2),
  descriptionEn: optionalText,
  descriptionAr: optionalText.pattern(arabicRegex).messages({
    "string.pattern.base": "Arabic description must contain only Arabic text",
  }),
  image: imageRef,
})
  .or("nameEn", "nameAr", "descriptionEn", "descriptionAr", "image")
  .unknown(false);

export const categoryIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).unknown(false);
