import Joi from "joi";

const textString = Joi.string().trim().max(255);
const optionalText = Joi.string().trim().max(1000).allow(null, "");
const imageRef = Joi.string()
  .trim()
  .max(500)
  .uri({ scheme: ["https"] })
  .pattern(/^https:\/\/res\.cloudinary\.com\//)
  .allow(null)
  .messages({
    "string.pattern.base": "Image must be a Cloudinary URL",
    "string.uri": "Image must be a secure Cloudinary URL",
  });

export const createCategorySchema = Joi.object({
  nameEn: textString.min(2).required().messages({
    "string.empty": "English name is required",
    "string.min": "English name must be at least 2 characters",
    "any.required": "English name is required",
  }),
  nameAr: textString.min(2).required().messages({
    "string.empty": "Arabic name is required",
    "string.min": "Arabic name must be at least 2 characters",
    "any.required": "Arabic name is required",
  }),
  descriptionEn: optionalText,
  descriptionAr: optionalText,
  image: imageRef,
}).unknown(false);

export const updateCategorySchema = Joi.object({
  nameEn: textString.min(2),
  nameAr: textString.min(2),
  descriptionEn: optionalText,
  descriptionAr: optionalText,
  image: imageRef,
})
  .or("nameEn", "nameAr", "descriptionEn", "descriptionAr", "image")
  .unknown(false);

export const categoryIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).unknown(false);
