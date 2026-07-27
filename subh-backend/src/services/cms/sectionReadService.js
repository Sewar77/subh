import {
  getAdminEditingMetadata,
  getSectionTemplate,
} from "../../cms/sectionTemplateRegistry.js";
import { listContentRecordsBySectionIds } from "../../models/sectionContent.Model.js";
import { listMediaBySectionIds } from "../../models/sectionMedia.Model.js";
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

const groupBySection = (rows) => {
  const grouped = new Map();
  for (const row of rows) {
    const key = String(row.section_id);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  return grouped;
};

export const hydrateSections = async (sections, { admin = false } = {}) => {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  const sectionIds = sections.map(({ id }) => id);
  const [contentRows, mediaRows, legacyRows] = await Promise.all([
    listContentRecordsBySectionIds(sectionIds),
    listMediaBySectionIds(sectionIds),
    SectionTranslationModel.getBySectionIds(sectionIds),
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
    const media = serializeSectionMediaList(rawMedia);
    const legacyTranslations = serializeLegacyTranslations(legacy);
    const translations =
      records.length > 0
        ? buildStructuredTranslations(section.id, templateKey, records, rawMedia)
        : legacyTranslations.length > 0
          ? attachMediaToTranslations(legacyTranslations, rawMedia, templateKey)
          : buildStructuredTranslations(section.id, templateKey, [], rawMedia);
    const content =
      records.length > 0
        ? serializeSectionContentObject(records)
        : serializeLegacyContentObject(legacy, template);

    return admin
      ? serializeAdminSection(
          section,
          content,
          media,
          translations,
          getAdminEditingMetadata(templateKey),
        )
      : serializePublicSection(section, content, media, translations);
  });
};

export const hydrateSection = async (section, options = {}) => {
  if (!section) return null;
  const [hydrated] = await hydrateSections([section], options);
  return hydrated || null;
};
