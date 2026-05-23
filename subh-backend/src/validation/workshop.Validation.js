import Joi from "joi";

const arabicRegex = /^[\u0600-\u06FF0-9\s\-.,()]+$/;

export const createWorkshopSchema = Joi.object({
  name_en: Joi.string().min(2).max(255).required().messages({
    "string.empty": "English workshop name is required",
    "string.min": "English workshop name must be at least 2 characters",
    "string.max": "English workshop name is too long",
    "any.required": "English workshop name is required",
  }),

  name_ar: Joi.string()
    .pattern(arabicRegex)
    .min(2)
    .max(255)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Arabic workshop name must contain only Arabic letters, numbers, and allowed symbols",
      "string.min": "Arabic workshop name is too short",
      "string.max": "Arabic workshop name is too long",
    }),

  gender: Joi.string()
    .valid("male", "female", "both")
    .default("both")
    .messages({
      "any.only": "Gender must be male, female, or both",
    }),

  is_all_ages: Joi.boolean().default(false),

  min_age: Joi.number().integer().min(0).allow(null),

  max_age: Joi.number().integer().min(0).allow(null),

  start_time: Joi.string().required().messages({
    "string.empty": "Start time is required",
    "any.required": "Start time is required",
  }),

  workshop_date: Joi.date().required().messages({
    "date.base": "Workshop date must be a valid date",
    "any.required": "Workshop date is required",
  }),

  trainer_name_en: Joi.string().min(2).max(255).required().messages({
    "string.empty": "Trainer English name is required",
    "any.required": "Trainer English name is required",
  }),

  trainer_name_ar: Joi.string().pattern(arabicRegex).allow("", null).messages({
    "string.pattern.base":
      "Trainer Arabic name must contain only Arabic characters",
  }),

  description_en: Joi.string().min(5).required().messages({
    "string.empty": "English description is required",
    "string.min": "English description is too short",
  }),

  description_ar: Joi.string().pattern(arabicRegex).allow("", null).messages({
    "string.pattern.base":
      "Arabic description must contain only Arabic characters",
  }),

  duration_h: Joi.number().integer().positive().required().messages({
    "number.base": "Duration must be a number",
    "number.positive": "Duration must be greater than 0",
    "any.required": "Duration is required",
  }),

  is_online: Joi.boolean().default(false),

  meeting_link: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Meeting link must be a valid URL",
  }),

  location_googlemap_link: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Location must be a valid Google Maps link",
  }),

  is_free: Joi.boolean().default(false),

  price: Joi.number().positive().allow(null).messages({
    "number.positive": "Price must be greater than 0",
  }),

  is_user_paid: Joi.boolean().default(false),

  status: Joi.string()
    .valid("available", "not_available")
    .default("available")
    .messages({
      "any.only": "Status must be available or not_available",
    }),

  image: Joi.string().uri().required().messages({
    "string.uri": "Image must be a valid URL",
    "any.required": "Image is required",
  }),

  seats_number: Joi.number().integer().positive().required().messages({
    "number.base": "Seats must be a number",
    "number.positive": "Seats must be greater than 0",
    "any.required": "Seats number is required",
  }),
});
