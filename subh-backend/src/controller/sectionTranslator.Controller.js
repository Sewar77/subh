import { getSectionTemplate } from "../cms/sectionTemplateRegistry.js";
import { getSectionForAdmin } from "../models/section.Model.js";
import { SectionTranslationModel } from "../models/sectionTranlsation.Model.js";
import { hydrateSection } from "../services/cms/sectionReadService.js";
import { writeLegacyCompatibilityPatch } from "../services/cms/sectionWriteService.js";
import { validateContentPatchForTemplate } from "../validation/sectionContent.Validation.js";
import { sectionMediaCreateSchema } from "../validation/sectionMedia.Validation.js";

const LEGACY_MEDIA_KEYS = new Set([
  "image",
  "img",
  "video",
  "logo",
  "notes",
  "theme_image",
]);

const chooseCompatibilitySlot = (template) =>
  template.mediaSlots.find(({ key }) => key === "image") ||
  template.mediaSlots.find(({ key }) => key === "background") ||
  template.mediaSlots.find(({ key }) => key === "media") ||
  null;

const inferMediaType = (legacyKey) => {
  if (legacyKey === "video") return "video";
  if (legacyKey === "notes") return "file";
  return "image";
};

export const getSectionTranslationsBySectionController = async (req, res) => {
  try {
    const rawSection = await getSectionForAdmin(req.params.id);
    if (!rawSection) return res.status(404).json({ message: "Section not found" });
    const section = await hydrateSection(rawSection, { admin: true });
    return res.status(200).json({
      success: true,
      translations: section.translations,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch translations" });
  }
};

export const updateSectionTranslationController = async (req, res) => {
  try {
    const legacyTranslation = await SectionTranslationModel.getById(
      req.params.id,
    );
    if (!legacyTranslation) {
      return res.status(404).json({ message: "Translation not found" });
    }
    if (!["en", "ar"].includes(legacyTranslation.locale)) {
      return res.status(409).json({ message: "Unsupported legacy locale" });
    }

    const section = await getSectionForAdmin(legacyTranslation.section_id);
    if (!section) return res.status(404).json({ message: "Section not found" });
    const template = getSectionTemplate(section.template_key);
    if (!template) {
      return res.status(409).json({ message: "Section template is not registered" });
    }

    const submittedContent = { ...(req.body.content || {}) };
    const mediaEntries = Object.entries(submittedContent).filter(([key]) =>
      LEGACY_MEDIA_KEYS.has(key),
    );
    for (const [key] of mediaEntries) delete submittedContent[key];
    if (mediaEntries.length > 1) {
      return res.status(400).json({ message: "Only one legacy media field may be updated at a time" });
    }

    const contentPatch = {};
    if (Object.hasOwn(req.body, "title")) {
      contentPatch.title = { [legacyTranslation.locale]: req.body.title };
    }
    for (const [fieldKey, value] of Object.entries(submittedContent)) {
      const definition = template.fields.find(({ key }) => key === fieldKey);
      contentPatch[fieldKey] = definition?.localized === false
        ? value
        : { [legacyTranslation.locale]: value };
    }

    const validation = validateContentPatchForTemplate(
      section.template_key,
      contentPatch,
    );
    if (!validation.ok) {
      return res.status(400).json({ message: "Invalid section content", errors: validation.errors });
    }

    let mediaPayload = null;
    if (mediaEntries.length === 1) {
      const [legacyKey, fileRef] = mediaEntries[0];
      const slot = chooseCompatibilitySlot(template);
      if (!slot) return res.status(400).json({ message: "Template has no media slot" });
      const mediaType = inferMediaType(legacyKey);
      if (!slot.mediaTypes.includes(mediaType)) {
        return res.status(400).json({ message: "Legacy media type is not allowed" });
      }
      const result = sectionMediaCreateSchema.validate(
        { slot: slot.key, mediaType, fileRef },
        { abortEarly: false, allowUnknown: false },
      );
      if (result.error) {
        return res.status(400).json({
          message: "Invalid media reference",
          errors: result.error.details.map(({ message }) => message),
        });
      }
      mediaPayload = result.value;
    }

    await writeLegacyCompatibilityPatch(
      section,
      validation.records,
      mediaPayload,
    );

    const hydrated = await hydrateSection(section, { admin: true });
    const translation = hydrated.translations.find(
      ({ locale }) => locale === legacyTranslation.locale,
    );
    return res.status(200).json({
      success: true,
      message: "Content migrated to structured storage",
      translation,
    });
  } catch (error) {
    if (error?.code === "CMS_LEGACY_CONTENT_INVALID") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to update translation" });
  }
};
