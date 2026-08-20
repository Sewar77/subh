import Joi from "joi";
import { WORKSHOP_ATTENDANCE_STATUSES, WORKSHOP_BOOKING_STATUSES, WORKSHOP_GENDERS, WORKSHOP_MODES, WORKSHOP_PAYMENT_METHODS, WORKSHOP_PUBLICATION_STATUSES, WORKSHOP_SESSION_STATUSES } from "../config/workshop.js";

const id = Joi.number().integer().positive();
const text = (max = 255) => Joi.string().trim().min(1).max(max);
const optionalText = (max = 1000) => text(max).allow(null, "");
const money = Joi.string().trim().pattern(/^\d{1,10}(?:\.\d{1,2})?$/);
const timezone = text(100).custom((value, helpers) => {
  try { new Intl.DateTimeFormat("en", { timeZone: value }).format(); return value; }
  catch { return helpers.message({ custom: "timezone must be a valid IANA time zone" }); }
});
const pagination = { page: Joi.number().integer().positive().default(1), limit: Joi.number().integer().min(1).max(100).default(20) };

export const workshopIdParamSchema = Joi.object({ id: id.required() }).unknown(false);
export const workshopSessionParamSchema = Joi.object({ sessionId: id.required() }).unknown(false);
export const workshopBookingParamSchema = Joi.object({ id: id.required() }).unknown(false);
export const workshopLanguageSchema = Joi.object({ lang: Joi.string().valid("en", "ar").default("en") }).unknown(false);
export const publicWorkshopListSchema = Joi.object({ ...pagination, lang: Joi.string().valid("en", "ar").default("en"), search: Joi.string().trim().max(200).allow("").default(""), categoryId: id, presenterId: id, mode: Joi.string().valid(...WORKSHOP_MODES), upcoming: Joi.boolean().truthy("true").falsy("false").default(true) }).unknown(false);

const categoryFields = { nameEn: text().required(), nameAr: text().required(), descriptionEn: optionalText(2000), descriptionAr: optionalText(2000) };
export const createWorkshopCategorySchema = Joi.object(categoryFields).unknown(false);
export const updateWorkshopCategorySchema = Joi.object(categoryFields).fork(Object.keys(categoryFields), (schema) => schema.optional()).min(1).unknown(false);

const presenterFields = { nameEn: text().required(), nameAr: text().required(), bioEn: optionalText(4000), bioAr: optionalText(4000), professionalTitleEn: optionalText(), professionalTitleAr: optionalText(), email: Joi.string().trim().email().max(320).allow(null, ""), phone: optionalText(40), imageUrl: Joi.string().uri().max(2000).allow(null, "") };
export const createWorkshopPresenterSchema = Joi.object(presenterFields).unknown(false);
export const updateWorkshopPresenterSchema = Joi.object(presenterFields).fork(Object.keys(presenterFields), (schema) => schema.optional()).min(1).unknown(false);

const workshopFields = { titleEn: text().required(), titleAr: text().required(), descriptionEn: text(12000).required(), descriptionAr: text(12000).required(), subjectEn: text(500).required(), subjectAr: text(500).required(), categoryId: id.required(), presenterId: id.required(), imageUrl: Joi.string().uri().max(2000).allow(null, ""), durationMinutes: Joi.number().integer().positive().max(10080).required(), price: money.required(), currencyCode: Joi.string().trim().uppercase().length(3), mode: Joi.string().valid(...WORKSHOP_MODES).required(), genderEligibility: Joi.string().valid(...WORKSHOP_GENDERS), minAge: Joi.number().integer().min(0).max(120).allow(null), maxAge: Joi.number().integer().min(0).max(120).allow(null), registrationInstructionsEn: optionalText(4000), registrationInstructionsAr: optionalText(4000), publicationStatus: Joi.string().valid(...WORKSHOP_PUBLICATION_STATUSES) };
const validateAgeRange = (value, helpers) => value.minAge != null && value.maxAge != null && value.minAge > value.maxAge ? helpers.message({ custom: "minAge must not exceed maxAge" }) : value;
export const createWorkshopSchema = Joi.object({ ...workshopFields, currencyCode: workshopFields.currencyCode.default("USD"), genderEligibility: workshopFields.genderEligibility.default("any"), publicationStatus: workshopFields.publicationStatus.default("draft") }).custom(validateAgeRange).unknown(false);
export const updateWorkshopSchema = Joi.object(workshopFields).fork(Object.keys(workshopFields), (schema) => schema.optional()).min(1).custom(validateAgeRange).unknown(false);

const sessionFields = { startsAt: Joi.date().iso().required(), endsAt: Joi.date().iso().required(), timezone: timezone.required(), seatCapacity: Joi.number().integer().positive().max(100000).required(), status: Joi.string().valid(...WORKSHOP_SESSION_STATUSES), priceOverride: money.allow(null, ""), meetingLink: Joi.string().uri().max(2000).allow(null, ""), venueName: optionalText(), addressLine1: optionalText(500), addressLine2: optionalText(500), city: optionalText(), state: optionalText(), postalCode: optionalText(40), country: optionalText(120), locationInstructions: optionalText(2000), mapUrl: Joi.string().uri().max(2000).allow(null, "") };
const validateSessionRange = (value, helpers) => value.startsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt) ? helpers.message({ custom: "endsAt must be later than startsAt" }) : value;
export const createWorkshopSessionSchema = Joi.object({ ...sessionFields, status: sessionFields.status.default("open") }).custom(validateSessionRange).unknown(false);
export const updateWorkshopSessionSchema = Joi.object(sessionFields).fork(Object.keys(sessionFields), (schema) => schema.optional()).min(1).custom(validateSessionRange).unknown(false);

export const createWorkshopBookingSchema = Joi.object({ fullName: text().required(), email: Joi.string().trim().lowercase().email().max(320).required(), phone: text(40).required(), age: Joi.number().integer().min(0).max(120).required(), gender: Joi.string().valid("male", "female").required(), addressLine1: text(500).required(), addressLine2: optionalText(500), city: text().required(), state: text().required(), postalCode: text(40).required(), country: text(120).required() }).unknown(false);
export const customerWorkshopBookingListSchema = Joi.object({ ...pagination, lang: Joi.string().valid("en", "ar").default("en") }).unknown(false);
export const adminWorkshopListSchema = Joi.object({ ...pagination, search: Joi.string().trim().max(200).allow(""), categoryId: id, presenterId: id, mode: Joi.string().valid(...WORKSHOP_MODES), publicationStatus: Joi.string().valid(...WORKSHOP_PUBLICATION_STATUSES) }).unknown(false);
export const adminWorkshopBookingListSchema = Joi.object({ ...pagination, search: Joi.string().trim().max(200).allow(""), workshopId: id, sessionId: id, bookingStatus: Joi.string().valid(...WORKSHOP_BOOKING_STATUSES), paymentStatus: Joi.string().valid("awaiting_payment", "paid", "voided"), attendanceStatus: Joi.string().valid(...WORKSHOP_ATTENDANCE_STATUSES), dateFrom: Joi.date().iso(), dateTo: Joi.date().iso() }).unknown(false);
export const workshopStatusUpdateSchema = Joi.object({ status: Joi.string().valid(...WORKSHOP_BOOKING_STATUSES).required(), note: optionalText(2000) }).unknown(false);
export const workshopPublicationSchema = Joi.object({ publicationStatus: Joi.string().valid(...WORKSHOP_PUBLICATION_STATUSES).required() }).unknown(false);
export const workshopSessionStatusSchema = Joi.object({ status: Joi.string().valid(...WORKSHOP_SESSION_STATUSES).required() }).unknown(false);
export const workshopAttendanceSchema = Joi.object({ attendanceStatus: Joi.string().valid(...WORKSHOP_ATTENDANCE_STATUSES).required(), note: optionalText(2000) }).unknown(false);
export const confirmWorkshopPaymentSchema = Joi.object({ amount: money.required(), paymentMethod: Joi.string().valid(...WORKSHOP_PAYMENT_METHODS).required(), externalReference: optionalText(), paidAt: Joi.date().iso().required(), note: optionalText(2000) }).unknown(false);
export const emptyWorkshopBodySchema = Joi.object({}).unknown(false);
