import Joi from "joi";
export const createSectionSchema = Joi.object({
  type: Joi.string()
    .valid("image", "image_text", "text_image", "text")
    .required()
    .messages({
      "any.only":
        "Invalid section type. Allowed types: image, image_text, text_image, text",
      "any.required": "type is required",
      "string.empty": "type cannot be empty",
    }),
});

export const updateSectionSchema = Joi.object({
  type: Joi.string().valid("text", "image_text", "gallery", "contact_form"),

  position: Joi.number().integer().min(0),

  is_visible: Joi.boolean(),
});
