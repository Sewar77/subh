import { getSectionTemplate } from "../../cms/sectionTemplateRegistry.js";
import {
  listSectionContentRecords,
  upsertSectionContentRecords,
} from "../../models/sectionContent.Model.js";
import {
  listSectionMedia,
  upsertFirstMediaInSlot,
} from "../../models/sectionMedia.Model.js";
import { SectionTranslationModel } from "../../models/sectionTranlsation.Model.js";
import { validateContentPatchForTemplate } from "../../validation/sectionContent.Validation.js";
import { sectionMediaCreateSchema } from "../../validation/sectionMedia.Validation.js";

const MEDIA_ALIASES = new Set([
  "image",
  "img",
  "video",
  "logo",
  "notes",
  "theme_image",
]);

const getMediaSlot = (template) =>
  template.mediaSlots.find(({ key }) => key === "image") ||
  template.mediaSlots.find(({ key }) => key === "background") ||
  template.mediaSlots.find(({ key }) => key === "media") ||
  null;

const inferMediaType = (legacyKey) => {
  if (legacyKey === "video") return "video";
  if (legacyKey === "notes") return "file";
  return "image";
};

const normalizeLegacyFieldKey = (template, fieldKey) => {
  if (template.fields.some(({ key }) => key === fieldKey)) return fieldKey;
  if (
    ["content", "subtitle"].includes(fieldKey) &&
    template.fields.some(({ key }) => key === "text")
  ) {
    return "text";
  }
  return null;
};

const buildLegacyContentPatch = (legacyRows, template) => {
  const content = {};
  const mediaCandidates = [];
  const unknownFields = new Set();
  const orderedRows = [...legacyRows].sort(
    (a, b) => ["en", "ar"].indexOf(a.locale) - ["en", "ar"].indexOf(b.locale),
  );

  for (const row of orderedRows) {
    if (!["en", "ar"].includes(row.locale)) continue;
    if (
      template.fields.some(({ key }) => key === "title") &&
      row.title !== undefined
    ) {
      content.title ||= {};
      content.title[row.locale] = row.title;
    }

    for (const [legacyKey, value] of Object.entries(row.content || {})) {
      if (MEDIA_ALIASES.has(legacyKey)) {
        if (typeof value === "string" && value.trim()) {
          mediaCandidates.push({
            legacyKey,
            fileRef: value,
            locale: row.locale,
          });
        }
        continue;
      }

      const fieldKey = normalizeLegacyFieldKey(template, legacyKey);
      if (!fieldKey) {
        unknownFields.add(legacyKey);
        continue;
      }
      const definition = template.fields.find(({ key }) => key === fieldKey);
      if (definition.localized) {
        content[fieldKey] ||= {};
        content[fieldKey][row.locale] = value;
      } else if (!Object.hasOwn(content, fieldKey)) {
        content[fieldKey] = value;
      }
    }
  }

  return { content, mediaCandidates, unknownFields: [...unknownFields] };
};

export const bootstrapLegacySection = async (section, client) => {
  const existingRecords = await listSectionContentRecords(section.id, client);
  if (existingRecords.length > 0) return { bootstrapped: false };

  const template = getSectionTemplate(section.template_key);
  if (!template) {
    const error = new Error("Section template is not registered");
    error.code = "CMS_TEMPLATE_UNKNOWN";
    throw error;
  }
  const legacyRows = await SectionTranslationModel.getBySectionId(
    section.id,
    client,
  );
  if (legacyRows.length === 0) return { bootstrapped: false };

  const legacy = buildLegacyContentPatch(legacyRows, template);
  if (legacy.unknownFields.length > 0) {
    const error = new Error(
      `Legacy content has unregistered fields: ${legacy.unknownFields.join(", ")}`,
    );
    error.code = "CMS_LEGACY_CONTENT_INVALID";
    throw error;
  }

  const validation = validateContentPatchForTemplate(
    section.template_key,
    legacy.content,
  );
  if (!validation.ok) {
    const error = new Error(validation.errors.join("; "));
    error.code = "CMS_LEGACY_CONTENT_INVALID";
    throw error;
  }
  if (validation.records.length > 0) {
    await upsertSectionContentRecords(section.id, validation.records, client);
  }

  const existingMedia = await listSectionMedia(section.id, client);
  const slot = getMediaSlot(template);
  if (existingMedia.length === 0 && slot && legacy.mediaCandidates.length > 0) {
    const candidate = legacy.mediaCandidates[0];
    const mediaType = inferMediaType(candidate.legacyKey);
    const result = sectionMediaCreateSchema.validate(
      { slot: slot.key, mediaType, fileRef: candidate.fileRef },
      { abortEarly: false, allowUnknown: false },
    );
    if (result.error || !slot.mediaTypes.includes(mediaType)) {
      const error = new Error(
        "Legacy media is not valid for the registered slot",
      );
      error.code = "CMS_LEGACY_CONTENT_INVALID";
      throw error;
    }
    await upsertFirstMediaInSlot(section.id, result.value, client);
  }

  return { bootstrapped: true };
};
