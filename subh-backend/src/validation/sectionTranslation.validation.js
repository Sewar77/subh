import Joi from "joi";

export const createTranslationSchema = Joi.object({
  locale: Joi.string().length(2).required(),
  title: Joi.string().allow("").optional(),
  content: Joi.object().required(),
});
