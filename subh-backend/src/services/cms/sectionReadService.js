import {
  getAppearanceKeyFromStorageKey,
  getAdminEditingMetadata,
  getSectionTemplate,
} from "../../cms/sectionTemplateRegistry.js";
import {
  listContentRecordsBySectionIds,
  listPublicContentRecordsBySectionIds,
} from "../../models/sectionContent.Model.js";
import {
  listMediaBySectionIds,
  listPublicMediaBySectionIds,
} from "../../models/sectionMedia.Model.js";
import { SectionTranslationModel } from "../../models/sectionTranlsation.Model.js";
import {
  attachMediaToTranslations,
  buildStructuredTranslations,
  serializeLegacyContentObject,
  serializeLegacyTranslations,
  serializeSectionContentObject,
} from "../../utils/sectionContentSerializer.js";
import { serializeSectionMediaList } from "../../utils/sectionMediaSerializer.js";
import {
  serializeAdminSection,
  serializePublicSection,
} from "../../utils/sectionSerializer.js";
import { normalizePublicLocale } from "../../utils/locale.js";

const serializePublicMedia = (mediaRows) =>
  mediaRows.map((media) => ({
    id: media.id,
    slot: media.slot_key,
    mediaType: media.media_type,
    fileRef: media.file_ref,
    url: media.file_ref,
    position: media.position,
    alt: media.alt,
    caption: media.caption,
  }));

const getPublicContent = (translations, locale) => {
  const translation = translations.find((item) => item.locale === locale);
  if (!translation) return {};
  return {
    ...(translation.title === null || translation.title === undefined
      ? {}
      : { title: translation.title }),
    ...(translation.content || {}),
  };
};

const groupBySection = (rows) => {
  const grouped = new Map();
  for (const row of rows) {
    const key = String(row.section_id);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  return grouped;
};

const splitStoredRecords = (records, template) => {
  const contentRecords = [];
  const appearance = {};
  const allowedAppearance = new Set(
    (template?.appearance || []).map(({ key }) => key),
  );

  for (const record of records) {
    const appearanceKey = getAppearanceKeyFromStorageKey(record.field_key);
    if (!appearanceKey) {
      contentRecords.push(record);
      continue;
    }
    if (allowedAppearance.has(appearanceKey)) {
      appearance[appearanceKey] = record.field_value;
    }
  }
  return { contentRecords, appearance };
};

export const hydrateSections = async (sections, { admin = false, locale } = {}) => {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  const sectionIds = sections.map(({ id }) => id);
  const publicLocale = normalizePublicLocale(locale);
  const [contentRows, mediaRows, legacyRows] = await Promise.all([
    admin
      ? listContentRecordsBySectionIds(sectionIds)
      : listPublicContentRecordsBySectionIds(sectionIds, publicLocale),
    admin
      ? listMediaBySectionIds(sectionIds)
      : listPublicMediaBySectionIds(sectionIds, publicLocale),
    admin
      ? SectionTranslationModel.getBySectionIds(sectionIds)
      : SectionTranslationModel.getPublicBySectionIds(sectionIds, publicLocale),
  ]);
  const contentBySection = groupBySection(contentRows);
  const mediaBySection = groupBySection(mediaRows);
  const legacyBySection = groupBySection(legacyRows);

  return sections.map((section) => {
    const sectionId = String(section.id);
    const records = contentBySection.get(sectionId) || [];
    const rawMedia = mediaBySection.get(sectionId) || [];
    const legacy = legacyBySection.get(sectionId) || [];
    const templateKey = section.template_key || section.type;
    const template = getSectionTemplate(templateKey);
    const { contentRecords, appearance } = splitStoredRecords(records, template);
    const media = admin
      ? serializeSectionMediaList(rawMedia)
      : serializePublicMedia(rawMedia);
    const legacyTranslations = serializeLegacyTranslations(legacy);
    const translations =
      contentRecords.length > 0
        ? buildStructuredTranslations(section.id, templateKey, contentRecords, rawMedia)
        : legacyTranslations.length > 0
          ? attachMediaToTranslations(legacyTranslations, rawMedia, templateKey)
          : buildStructuredTranslations(section.id, templateKey, [], rawMedia);
    const content =
      contentRecords.length > 0
        ? serializeSectionContentObject(contentRecords)
        : serializeLegacyContentObject(legacy, template);

    return admin
      ? serializeAdminSection(
          section,
          content,
          media,
          translations,
          getAdminEditingMetadata(templateKey),
          appearance,
        )
      : serializePublicSection(
          section,
          getPublicContent(translations, publicLocale),
          media,
          appearance,
        );
  });
};

export const hydrateSection = async (section, options = {}) => {
  if (!section) return null;
  const [hydrated] = await hydrateSections([section], options);
  return hydrated || null;
};
