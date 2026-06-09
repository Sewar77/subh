import Joi from "joi";

/**
 * CREATE PAGE
 */
export const createPageSchema = Joi.object({
  template_id: Joi.number().integer().required().messages({
    "number.base": "template_id must be a number",
    "any.required": "template_id is required",
  }),

  key: Joi.string()
    .pattern(/^[a-z0-9_-]{2,100}$/)
    .required()
    .messages({
      "string.base": "key must be a string",
      "string.empty": "key is required",
      "string.pattern.base": "key must be 2–100 chars (a-z, 0-9, _ or - only)",
      "any.required": "key is required",
    }),
});

/**
 * UPDATE PAGE
 */
export const updatePageSchema = Joi.object({
  template_id: Joi.number().integer().optional().messages({
    "number.base": "template_id must be a number",
  }),

  key: Joi.string()
    .pattern(/^[a-z0-9_-]{2,100}$/)
    .optional()
    .messages({
      "string.base": "key must be a string",
      "string.pattern.base": "key must be 2–100 chars (a-z, 0-9, _ or - only)",
    }),

  status: Joi.string().valid("draft", "published").optional().messages({
    "any.only": "status must be either draft or published",
  }),
});
