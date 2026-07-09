import Joi from "joi";

// =========================
// CREATE PAGE
// =========================

export const createPageSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-z0-9_-]{2,100}$/)
    .required()
    .messages({
      "string.base": "key must be a string",
      "string.empty": "key is required",
      "string.pattern.base": "key must be 2–100 chars (a-z, 0-9, _ or - only)",
      "any.required": "key is required",
    }),

  name: Joi.string().min(2).max(150).required().messages({
    "string.base": "name must be a string",
    "string.empty": "name is required",
    "string.min": "name must be at least 2 characters",
    "string.max": "name must not exceed 150 characters",
    "any.required": "name is required",
  }),

  status: Joi.string().valid("draft", "published").optional().messages({
    "any.only": "status must be either draft or published",
  }),
});

// =========================
// UPDATE PAGE
// =========================

export const updatePageSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-z0-9_-]{2,100}$/)
    .optional()
    .messages({
      "string.base": "key must be a string",
      "string.pattern.base": "key must be 2–100 chars (a-z, 0-9, _ or - only)",
    }),

  name: Joi.string().min(2).max(150).optional().messages({
    "string.base": "name must be a string",
    "string.min": "name must be at least 2 characters",
    "string.max": "name must not exceed 150 characters",
  }),

  status: Joi.string().valid("draft", "published").optional().messages({
    "any.only": "status must be either draft or published",
  }),
});
