import Joi from "joi";

export const createSectionSchema = Joi.object({
  type: Joi.string()
    .valid(
      "hero",
      "text",
      "image_text",
      "gallery",
      "contact_form",
      "image",
      "text_image",
    )
    .required()
    .messages({
      "any.only": "Invalid section type",
      "any.required": "type is required",
    }),

  position: Joi.number().integer().min(0).required(),
});

export const updateSectionSchema = Joi.object({
  type: Joi.string().valid(
    "hero",
    "text",
    "image_text",
    "gallery",
    "contact_form",
  ),

  position: Joi.number().integer().min(0),

  is_visible: Joi.boolean(),
});
