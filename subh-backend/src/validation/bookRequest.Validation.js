import Joi from "joi";
import {
  DEFAULT_BOOK_REQUEST_PAGE_SIZE,
  MAX_BOOK_REQUEST_ITEMS,
  MAX_BOOK_REQUEST_PAGE_SIZE,
  MAX_BOOK_REQUEST_QUANTITY,
} from "../config/bookRequest.js";

const requiredText = (max) => Joi.string().trim().min(1).max(max).required();
const optionalText = (max) => Joi.string().trim().min(1).max(max);

const requestItemSchema = Joi.object({
  bookId: Joi.number().integer().positive().required(),
  quantity: Joi.number()
    .integer()
    .positive()
    .max(MAX_BOOK_REQUEST_QUANTITY)
    .required(),
}).unknown(false);

const shippingSchema = Joi.object({
  recipient: requiredText(200),
  company: optionalText(200),
  phone: requiredText(30),
  addressLine1: requiredText(300),
  addressLine2: optionalText(300),
  city: requiredText(120),
  state: requiredText(120),
  postalCode: requiredText(30),
  country: Joi.string()
    .trim()
    .length(2)
    .pattern(/^[A-Za-z]{2}$/)
    .uppercase()
    .required(),
  notes: optionalText(1000),
}).unknown(false);

export const createBookRequestSchema = Joi.object({
  items: Joi.array()
    .items(requestItemSchema)
    .min(1)
    .max(MAX_BOOK_REQUEST_ITEMS)
    .unique("bookId")
    .required(),
  shipping: shippingSchema.required(),
  customerNote: optionalText(2000),
}).unknown(false);

export const bookRequestIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).unknown(false);

export const bookRequestListQuerySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number()
    .integer()
    .positive()
    .max(MAX_BOOK_REQUEST_PAGE_SIZE)
    .default(DEFAULT_BOOK_REQUEST_PAGE_SIZE),
  lang: Joi.string().valid("en", "ar").default("en"),
}).unknown(false);

export const bookRequestDetailQuerySchema = Joi.object({
  lang: Joi.string().valid("en", "ar").default("en"),
}).unknown(false);
