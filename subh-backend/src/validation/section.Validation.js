import Joi from "joi";
export const updateSectionSchema = Joi.object({
  position: Joi.number().integer().min(0),
  isVisible: Joi.boolean(),
})
  .or("position", "isVisible")
  .unknown(false);
