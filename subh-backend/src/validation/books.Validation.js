import Joi from "joi";

const positiveNumber = Joi.number().min(0);
const optionalImage = Joi.string().trim().max(500).allow(null, "");
const optionalDescription = Joi.string().trim().max(5000).allow(null, "");

const authorIdsArray = Joi.array()
  .items(Joi.number().integer().positive())
  .unique()
  .max(50)
  .default([]);

export const createBookSchema = Joi.object({
  nameEn: Joi.string().trim().min(2).max(255).required().messages({
    "string.empty": "English name is required",
    "string.min": "English name must be at least 2 characters",
    "any.required": "English name is required",
  }),
  nameAr: Joi.string().trim().min(2).max(255).required().messages({
    "string.empty": "Arabic name is required",
    "string.min": "Arabic name must be at least 2 characters",
    "any.required": "Arabic name is required",
  }),
  descriptionEn: optionalDescription,
  descriptionAr: optionalDescription,
  weightKg: Joi.number().min(0).required().messages({
    "number.base": "Weight must be a number",
    "number.min": "Weight must be zero or greater",
    "any.required": "Weight is required",
  }),
  barcodeImage: optionalImage,
  categoryId: Joi.number().integer().positive().allow(null),
  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be zero or greater",
    "any.required": "Price is required",
  }),
  shippingCost: Joi.number().min(0).allow(null),
  lengthCm: positiveNumber.allow(null),
  widthCm: positiveNumber.allow(null),
  heightCm: positiveNumber.allow(null),
  coverImage: optionalImage,
  isbn: Joi.string().trim().min(13).max(26).required().messages({
    "string.empty": "ISBN is required",
    "string.min": "ISBN must be at least 13 characters",
    "string.max": "ISBN must be at most 26 characters",
    "any.required": "ISBN is required",
  }),
  authorIds: authorIdsArray,
}).unknown(false);

export const updateBookSchema = Joi.object({
  nameEn: Joi.string().trim().min(2).max(255),
  nameAr: Joi.string().trim().min(2).max(255),
  descriptionEn: optionalDescription,
  descriptionAr: optionalDescription,
  weightKg: Joi.number().min(0),
  barcodeImage: optionalImage,
  categoryId: Joi.number().integer().positive().allow(null),
  price: Joi.number().min(0),
  shippingCost: Joi.number().min(0),
  lengthCm: positiveNumber.allow(null),
  widthCm: positiveNumber.allow(null),
  heightCm: positiveNumber.allow(null),
  coverImage: optionalImage,
  isbn: Joi.string().trim().min(13).max(26),
  authorIds: authorIdsArray,
})
  .or(
    "nameEn",
    "nameAr",
    "descriptionEn",
    "descriptionAr",
    "weightKg",
    "barcodeImage",
    "categoryId",
    "price",
    "shippingCost",
    "lengthCm",
    "widthCm",
    "heightCm",
    "coverImage",
    "isbn",
    "authorIds",
  )
  .unknown(false);

export const bookIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).unknown(false);

export const categoryIdParamSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
}).unknown(false);

export const listBooksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(100).allow("", null),
  categoryId: Joi.number().integer().positive().allow(null),
  minPrice: Joi.number().min(0).allow(null),
  maxPrice: Joi.number().min(0).allow(null),
  sortBy: Joi.string()
    .valid("createdAt", "price", "nameEn", "nameAr")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
}).unknown(false);
