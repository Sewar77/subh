import Joi from "joi";
import {
  getAppearanceStorageKey,
  getSectionTemplate,
} from "../cms/sectionTemplateRegistry.js";

const scalarValue = Joi.alternatives().try(
  Joi.string(),
  Joi.number(),
  Joi.boolean(),
  Joi.valid(null),
);

const localizedValue = Joi.object({
  en: scalarValue,
  ar: scalarValue,
})
  .min(1)
  .unknown(false);

export const sectionContentPatchSchema = Joi.object({
  content: Joi.object()
    .min(1)
    .pattern(Joi.string().pattern(/^[A-Za-z][A-Za-z0-9]*$/), Joi.alternatives().try(scalarValue, localizedValue))
    .required(),
}).unknown(false);

const approvedLinkPattern = /^(https?:\/\/|mailto:|tel:|\/)(?!\/)/i;

const validateScalar = (definition, value, path) => {
  if (value === null) {
    return definition.nullable
      ? null
      : `${path} cannot be null`;
  }

  if (definition.type === "boolean") {
    return typeof value === "boolean" ? null : `${path} must be a boolean`;
  }
  if (definition.type === "integer") {
    return Number.isInteger(value) ? null : `${path} must be an integer`;
  }
  if (definition.type === "decimal") {
    return typeof value === "number" && Number.isFinite(value)
      ? null
      : `${path} must be a number`;
  }
  if (typeof value !== "string") {
    return `${path} must be a string`;
  }
  if (!definition.nullable && value.trim().length === 0) {
    return `${path} cannot be empty`;
  }
  if (value.length > definition.maxLength) {
    return `${path} must not exceed ${definition.maxLength} characters`;
  }
  if (definition.type === "url" && !approvedLinkPattern.test(value)) {
    return `${path} must be an approved http, https, mailto, tel, or site-relative link`;
  }
  return null;
};

const toStoredValue = (value) => {
  if (value === null || typeof value === "string") return value;
  return String(value);
};

export const validateContentPatchForTemplate = (templateKey, content) => {
  const template = getSectionTemplate(templateKey);
  if (!template) {
    return { ok: false, errors: ["Unknown section template"] };
  }

  const errors = [];
  const records = [];

  for (const [fieldKey, submittedValue] of Object.entries(content || {})) {
    const definition = template.fields.find(({ key }) => key === fieldKey);
    if (!definition) {
      errors.push(`Unknown content field: ${fieldKey}`);
      continue;
    }

    if (definition.localized) {
      if (
        !submittedValue ||
        typeof submittedValue !== "object" ||
        Array.isArray(submittedValue)
      ) {
        errors.push(`${fieldKey} must contain en and/or ar values`);
        continue;
      }

      const locales = Object.keys(submittedValue);
      if (
        locales.length === 0 ||
        locales.some((locale) => !["en", "ar"].includes(locale))
      ) {
        errors.push(`${fieldKey} accepts only en and ar values`);
        continue;
      }

      for (const locale of locales) {
        const value = submittedValue[locale];
        const error = validateScalar(definition, value, `${fieldKey}.${locale}`);
        if (error) {
          errors.push(error);
          continue;
        }
        records.push({
          locale,
          fieldKey,
          fieldValue: toStoredValue(value),
          fieldType: definition.type,
        });
      }
      continue;
    }

    if (
      submittedValue &&
      typeof submittedValue === "object" &&
      !Array.isArray(submittedValue)
    ) {
      errors.push(`${fieldKey} is not localized`);
      continue;
    }

    const error = validateScalar(definition, submittedValue, fieldKey);
    if (error) {
      errors.push(error);
      continue;
    }
    records.push({
      locale: "neutral",
      fieldKey,
      fieldValue: toStoredValue(submittedValue),
      fieldType: definition.type,
    });
  }

  return { ok: errors.length === 0, errors, records, template };
};

export const validateAppearanceForTemplate = (templateKey, appearance = {}) => {
  const template = getSectionTemplate(templateKey);
  if (!template) return { ok: false, errors: ["Unknown section template"], records: [] };

  const errors = [];
  const records = [];
  for (const [key, value] of Object.entries(appearance)) {
    const control = template.appearance.find((item) => item.key === key);
    if (!control) {
      errors.push(`Unknown appearance field: ${key}`);
      continue;
    }
    if (value !== null && !control.values.includes(value)) {
      errors.push(`${key} must be one of: ${control.values.join(", ")}`);
      continue;
    }
    records.push({
      locale: "neutral",
      fieldKey: getAppearanceStorageKey(key),
      fieldValue: value,
      fieldType: "text",
    });
  }
  return { ok: errors.length === 0, errors, records, template };
};

export const sectionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).unknown(false);

export const pageIdParamSchema = Joi.object({
  pageId: Joi.number().integer().positive().required(),
}).unknown(false);

export const pageSectionsParamSchema = Joi.object({
  page_id: Joi.number().integer().positive().required(),
}).unknown(false);

export const pageKeyParamSchema = Joi.object({
  key: Joi.string().pattern(/^[a-z0-9_-]{2,150}$/).required(),
}).unknown(false);

export const sectionVisibilitySchema = Joi.object({
  isVisible: Joi.boolean().required(),
}).unknown(false);

export const sectionReorderSchema = Joi.object({
  sectionIds: Joi.array()
    .items(Joi.number().integer().positive().required())
    .min(1)
    .unique(),
  sections: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
        position: Joi.number().integer().min(0).required(),
      }).unknown(false),
    )
    .min(1)
    .unique("id")
    .unique("position")
    .unique("position"),
})
  .xor("sectionIds", "sections")
  .unknown(false);

export const legacyTranslationPatchSchema = Joi.object({
  title: Joi.alternatives().try(Joi.string(), Joi.valid(null)),
  content: Joi.object()
    .pattern(
      Joi.string().pattern(/^[A-Za-z][A-Za-z0-9_]*$/),
      scalarValue,
    )
    .unknown(false),
})
  .or("title", "content")
  .unknown(false);
