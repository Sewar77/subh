import Joi from "joi";

export const pagesSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-z0-9_-]{2,100}$/)
    .required()
    .messages({
      "string.base": "Key must be a string",
      "string.empty": "Key is required",
      "string.pattern.base":
        "Key must be 2–100 characters and can only contain lowercase letters, numbers, _ or -",
      "any.required": "Key is required",
    }),

  name: Joi.string().min(3).max(150).required().trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must be at most 150 characters",
    "any.required": "Name is required",
  }),
});
