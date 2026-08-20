import Joi from "joi";
import { getSectionTemplate, hasSectionTemplate } from "../cms/sectionTemplateRegistry.js";
import {
  isMediaReferenceCompatible,
  sectionMediaCreateSchema,
} from "./sectionMedia.Validation.js";

const scalarValue = Joi.alternatives().try(
  Joi.string(),
  Joi.number(),
  Joi.boolean(),
  Joi.valid(null),
);
const localizedValue = Joi.object({ en: scalarValue, ar: scalarValue })
  .min(1)
  .unknown(false);
const contentObject = Joi.object().pattern(
  Joi.string().pattern(/^[A-Za-z][A-Za-z0-9]*$/),
  Joi.alternatives().try(scalarValue, localizedValue),
);
const appearanceObject = Joi.object().pattern(
  Joi.string().pattern(/^[A-Za-z][A-Za-z0-9]*$/),
  Joi.alternatives().try(Joi.string().trim().max(100), Joi.valid(null)),
);

export const sectionCreateSchema = Joi.object({
  templateKey: Joi.string().pattern(/^[a-z][a-z0-9_]{1,99}$/).required(),
  position: Joi.number().integer().min(0),
  content: contentObject,
  appearance: appearanceObject,
  media: Joi.array().items(sectionMediaCreateSchema).max(20),
}).unknown(false);

export const sectionDuplicateSchema = Joi.object({
  position: Joi.number().integer().min(0),
}).unknown(false);

export const sectionAppearancePatchSchema = Joi.object({
  appearance: appearanceObject.min(1).required(),
}).unknown(false);

export const orderedSectionIdsSchema = Joi.object({
  sectionIds: Joi.array()
    .items(Joi.number().integer().positive().required())
    .min(1)
    .unique()
    .required(),
}).unknown(false);

export const validateInitialMediaForTemplate = (templateKey, media = []) => {
  const template = getSectionTemplate(templateKey);
  if (!template) return { ok: false, errors: ["Unknown section template"], media: [] };

  const errors = [];
  const counts = new Map();
  for (const item of media) {
    const slot = template.mediaSlots.find(({ key }) => key === item.slot);
    if (!slot) {
      errors.push(`Unknown media slot: ${item.slot}`);
      continue;
    }
    if (!slot.mediaTypes.includes(item.mediaType)) {
      errors.push(`${item.slot} does not accept ${item.mediaType}`);
    }
    if (!isMediaReferenceCompatible(item.mediaType, item.fileRef)) {
      errors.push(`${item.slot} file reference does not match its media type`);
    }
    const count = (counts.get(item.slot) || 0) + 1;
    counts.set(item.slot, count);
    if (count > slot.maxItems) {
      errors.push(`${item.slot} accepts at most ${slot.maxItems} item(s)`);
    }
  }
  return { ok: errors.length === 0, errors, media };
};

export const assertRegisteredTemplate = (templateKey) => {
  if (hasSectionTemplate(templateKey)) return;
  const error = new Error("Section template is not registered");
  error.code = "CMS_TEMPLATE_UNKNOWN";
  throw error;
};
