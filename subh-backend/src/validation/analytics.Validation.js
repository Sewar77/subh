import Joi from "joi";
import {
  ANALYTICS_DEVICE_CATEGORIES,
  ANALYTICS_ENTITY_TYPES,
  ANALYTICS_EVENT_ENTITY_RULES,
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_EVENT_PROPERTY_ALLOWLIST,
  ANALYTICS_LOCALES,
  ANALYTICS_MAX_RANGE_DAYS,
  ANALYTICS_PROPERTIES_MAX_BYTES,
} from "../config/analytics.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });
const safeText = (max) => Joi.string().trim().max(max);

const propertiesSchema = Joi.object()
  .custom((value, helpers) => {
    if (Buffer.byteLength(JSON.stringify(value), "utf8") > ANALYTICS_PROPERTIES_MAX_BYTES) {
      return helpers.message({ custom: "properties is too large" });
    }
    for (const propertyValue of Object.values(value)) {
      if (
        propertyValue !== null &&
        typeof propertyValue !== "string" &&
        typeof propertyValue !== "number" &&
        typeof propertyValue !== "boolean"
      ) {
        return helpers.message({ custom: "properties values must be scalar" });
      }
      if (typeof propertyValue === "string" && propertyValue.length > 120) {
        return helpers.message({ custom: "properties text is too long" });
      }
    }
    return value;
  })
  .default({});

export const analyticsEventSchema = Joi.object({
  eventKey: uuid.required(),
  visitorKey: uuid.required(),
  sessionKey: uuid.required(),
  eventName: Joi.string().valid(...ANALYTICS_EVENT_NAMES).required(),
  eventVersion: Joi.number().integer().valid(1).default(1),
  pagePath: safeText(500).pattern(/^\//).allow(null, ""),
  locale: Joi.string().valid(...ANALYTICS_LOCALES).default("en"),
  entityType: Joi.string().valid(...ANALYTICS_ENTITY_TYPES),
  entityId: Joi.number().integer().positive(),
  properties: propertiesSchema,
  landingPath: safeText(500).pattern(/^\//).allow(null, ""),
  referrerHost: safeText(255).hostname().allow(null, ""),
  utmSource: safeText(120).allow(null, ""),
  utmMedium: safeText(120).allow(null, ""),
  utmCampaign: safeText(160).allow(null, ""),
  deviceCategory: Joi.string().valid(...ANALYTICS_DEVICE_CATEGORIES).default("other"),
})
  .and("entityType", "entityId")
  .custom((value, helpers) => {
    const allowedProperties = ANALYTICS_EVENT_PROPERTY_ALLOWLIST[value.eventName];
    const unknownProperties = Object.keys(value.properties || {}).filter(
      (key) => !allowedProperties.includes(key),
    );
    if (unknownProperties.length) {
      return helpers.message({ custom: "properties contains fields not allowed for this event" });
    }
    for (const key of ["resultCount", "itemCount", "totalQuantity", "quantity"]) {
      if (value.properties?.[key] !== undefined) {
        const number = value.properties[key];
        if (!Number.isInteger(number) || number < 0 || number > 1_000_000) {
          return helpers.message({ custom: `${key} must be a bounded non-negative integer` });
        }
      }
    }
    const entityRules = ANALYTICS_EVENT_ENTITY_RULES[value.eventName];
    if (entityRules && !entityRules.includes(value.entityType)) {
      return helpers.message({ custom: "entityType is not valid for this event" });
    }
    return value;
  })
  .unknown(false);

const validTimezone = safeText(100).custom((value, helpers) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return value;
  } catch {
    return helpers.message({ custom: "timezone must be a valid IANA time zone" });
  }
});

export const analyticsRangeSchema = Joi.object({
  preset: Joi.string().valid("7d", "30d", "90d", "year", "custom").default("30d"),
  dateFrom: Joi.date().iso().raw(),
  dateTo: Joi.date().iso().raw(),
  timezone: validTimezone.default("Africa/Cairo"),
})
  .custom((value, helpers) => {
    if (value.preset === "custom" && (!value.dateFrom || !value.dateTo)) {
      return helpers.message({ custom: "dateFrom and dateTo are required for a custom range" });
    }
    if (value.dateFrom && value.dateTo) {
      const from = new Date(value.dateFrom);
      const to = new Date(value.dateTo);
      if (to < from) return helpers.message({ custom: "dateTo must not be before dateFrom" });
      if ((to - from) / 86_400_000 > ANALYTICS_MAX_RANGE_DAYS) {
        return helpers.message({ custom: `date range cannot exceed ${ANALYTICS_MAX_RANGE_DAYS} days` });
      }
    }
    return value;
  })
  .unknown(false);

export const analyticsCustomerRangeSchema = analyticsRangeSchema.keys({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  segment: Joi.string().valid("all", "request_only", "one_time", "repeat", "loyal", "high_value").default("all"),
});

