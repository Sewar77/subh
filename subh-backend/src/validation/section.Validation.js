import Joi from "joi";

export const sectionSchema = Joi.object({
  pageId: Joi.number().integer().required(),

  type: Joi.string().min(2).max(100).required().messages({
    "string.base": "Type must be a string",
    "string.empty": "Type is required",
  }),

  settings: Joi.object().default({}),
});
