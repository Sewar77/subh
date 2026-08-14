import Joi from "joi";
import {
  BOOK_REQUEST_STATUSES,
  CONTACT_METHODS,
  CONTACT_OUTCOMES,
  DEFAULT_BOOK_REQUEST_PAGE_SIZE,
  MAX_BOOK_REQUEST_PAGE_SIZE,
  MAX_BOOK_REQUEST_QUANTITY,
} from "../config/bookRequest.js";

const optionalNote = (max = 4000) =>
  Joi.string().trim().min(1).max(max).allow(null);
const money = (integerDigits) =>
  Joi.string()
    .trim()
    .pattern(new RegExp(`^\\d{1,${integerDigits}}(?:\\.\\d{1,2})?$`))
    .required();

export const adminBookRequestListQuerySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number()
    .integer()
    .positive()
    .max(MAX_BOOK_REQUEST_PAGE_SIZE)
    .default(DEFAULT_BOOK_REQUEST_PAGE_SIZE),
  requestStatus: Joi.string().valid(...BOOK_REQUEST_STATUSES.request),
  contactStatus: Joi.string().valid(...BOOK_REQUEST_STATUSES.contact),
  paymentStatus: Joi.string().valid(...BOOK_REQUEST_STATUSES.payment),
  fulfillmentStatus: Joi.string().valid(...BOOK_REQUEST_STATUSES.fulfillment),
  quoteStatus: Joi.string().valid(...BOOK_REQUEST_STATUSES.quote),
  assignedAdminId: Joi.number().integer().positive().allow(null),
  customerType: Joi.string().valid("individual", "company"),
  followUpDue: Joi.boolean(),
  createdFrom: Joi.date().iso(),
  createdTo: Joi.date().iso(),
  search: Joi.string().trim().min(1).max(200),
})
  .custom((value, helpers) => {
    if (
      value.createdFrom &&
      value.createdTo &&
      value.createdFrom > value.createdTo
    ) {
      return helpers.message({
        custom: "createdTo must be on or after createdFrom",
      });
    }
    return value;
  })
  .unknown(false);

export const adminAssignmentSchema = Joi.object({
  assignedAdminId: Joi.number().integer().positive().allow(null).required(),
}).unknown(false);

export const adminWorkflowStatusSchema = Joi.object({
  statusType: Joi.string()
    .valid("request", "contact", "quote", "fulfillment")
    .required(),
  status: Joi.string().required(),
  note: optionalNote(1000),
})
  .custom((value, helpers) => {
    if (!BOOK_REQUEST_STATUSES[value.statusType]?.includes(value.status)) {
      return helpers.message({ custom: "Status is not valid for statusType" });
    }
    return value;
  })
  .unknown(false);

const quoteItemSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
  agreedQuantity: Joi.number()
    .integer()
    .positive()
    .max(MAX_BOOK_REQUEST_QUANTITY)
    .required(),
  agreedUnitPrice: money(10),
}).unknown(false);

export const adminQuoteSchema = Joi.object({
  items: Joi.array().items(quoteItemSchema).min(1).max(100).unique("itemId").required(),
  shippingCost: money(12),
  discountAmount: money(12),
  taxAmount: money(12),
  quoteValidUntil: Joi.date().iso().min("now").required(),
  customerVisibleNote: optionalNote(),
  historyNote: optionalNote(1000),
}).unknown(false);

export const adminRequestNotesSchema = Joi.object({
  customerVisibleNote: optionalNote(),
  adminInternalNote: optionalNote(),
})
  .or("customerVisibleNote", "adminInternalNote")
  .unknown(false);

export const adminContactHistorySchema = Joi.object({
  contactMethod: Joi.string().valid(...CONTACT_METHODS).required(),
  outcome: Joi.string().valid(...CONTACT_OUTCOMES).required(),
  note: optionalNote(2000),
  contactedAt: Joi.date().iso().max("now"),
  nextFollowUpAt: Joi.date().iso().allow(null),
})
  .custom((value, helpers) => {
    if (
      value.contactedAt &&
      value.nextFollowUpAt &&
      value.nextFollowUpAt < value.contactedAt
    ) {
      return helpers.message({
        custom: "nextFollowUpAt must be on or after contactedAt",
      });
    }
    return value;
  })
  .unknown(false);
