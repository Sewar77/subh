import Joi from "joi";
const arabicRegex = /^[\u0600-\u06FF0-9\s\-.,()]+$/;
export const createCategorySchema = Joi.object({
  name_en: Joi.string().min(2).max(255).required(),
  name_ar: Joi.string().pattern(arabicRegex).min(2).max(255).allow(null, ""),
  description_en: Joi.string().allow("", null),
  image: Joi.string().uri().required(),
  description_ar: Joi.string().pattern(arabicRegex).allow("", null),
});
