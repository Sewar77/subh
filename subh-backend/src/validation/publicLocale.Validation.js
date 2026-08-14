import Joi from "joi";

export const publicLocaleQuerySchema = Joi.object({
  lang: Joi.string().valid("en", "ar").default("en"),
}).unknown(false);

export const publicBooksQuerySchema = publicLocaleQuerySchema.keys({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  categoryId: Joi.number().integer().positive().allow(null),
  search: Joi.string().trim().max(100).allow("", null),
  minPrice: Joi.number().min(0).allow(null),
  maxPrice: Joi.number().min(0).allow(null),
  sortBy: Joi.string().valid("createdAt", "price", "name").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
}).custom((value, helpers) => {
  if (
    value.minPrice != null &&
    value.maxPrice != null &&
    value.minPrice > value.maxPrice
  ) {
    return helpers.message({
      custom: "Maximum price must be greater than or equal to minimum price",
    });
  }

  return value;
});
