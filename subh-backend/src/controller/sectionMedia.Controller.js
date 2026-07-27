import {
  getSectionTemplate,
  getTemplateMediaSlot,
} from "../cms/sectionTemplateRegistry.js";
import {
  createSectionMedia,
  deleteSectionMedia,
  getSectionMediaById,
  listSectionMedia,
  listSectionMediaSlot,
  patchSectionMedia,
  reorderSectionMedia,
} from "../models/sectionMedia.Model.js";
import { getSectionForAdmin } from "../models/section.Model.js";
import {
  serializeSectionMedia,
  serializeSectionMediaList,
} from "../utils/sectionMediaSerializer.js";
import { isMediaReferenceCompatible } from "../validation/sectionMedia.Validation.js";

const loadSection = async (id) => {
  const section = await getSectionForAdmin(id);
  if (!section) return { error: "not_found" };
  if (!getSectionTemplate(section.template_key)) {
    return { error: "unknown_template" };
  }
  return { section };
};

const respondLoadError = (res, error) => {
  if (error === "not_found") {
    res.status(404).json({ message: "Section not found" });
  } else {
    res.status(409).json({ message: "Section template is not registered" });
  }
};

export const listSectionMediaController = async (req, res) => {
  try {
    const loaded = await loadSection(req.params.id);
    if (loaded.error) return respondLoadError(res, loaded.error);
    const media = serializeSectionMediaList(await listSectionMedia(loaded.section.id));
    return res.status(200).json({ media });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch section media" });
  }
};

export const createSectionMediaController = async (req, res) => {
  try {
    const loaded = await loadSection(req.params.id);
    if (loaded.error) return respondLoadError(res, loaded.error);
    const slot = getTemplateMediaSlot(loaded.section.template_key, req.body.slot);
    if (!slot) return res.status(400).json({ message: "Unknown media slot" });
    if (!slot.mediaTypes.includes(req.body.mediaType)) {
      return res.status(400).json({ message: "Media type is not allowed for this slot" });
    }

    const mediaPayload = {
      slot: req.body.slot,
      mediaType: req.body.mediaType,
      fileRef: req.body.fileRef,
      altEn: req.body.altEn,
      altAr: req.body.altAr,
      captionEn: req.body.captionEn,
      captionAr: req.body.captionAr,
    };
    const created = await createSectionMedia(
      loaded.section.id,
      mediaPayload,
      slot,
    );
    return res.status(201).json({ media: serializeSectionMedia(created) });
  } catch (error) {
    if (error?.code === "CMS_MEDIA_SLOT_FULL") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to add section media" });
  }
};

export const updateSectionMediaController = async (req, res) => {
  try {
    const loaded = await loadSection(req.params.id);
    if (loaded.error) return respondLoadError(res, loaded.error);
    const current = await getSectionMediaById(req.params.mediaId);
    if (!current || Number(current.section_id) !== Number(loaded.section.id)) {
      return res.status(404).json({ message: "Media item not found" });
    }
    const slot = getTemplateMediaSlot(loaded.section.template_key, current.slot_key);
    if (!slot || !slot.mediaTypes.includes(current.media_type)) {
      return res.status(409).json({ message: "Media item does not match the section template" });
    }
    if (
      req.body.fileRef &&
      !isMediaReferenceCompatible(current.media_type, req.body.fileRef)
    ) {
      return res.status(400).json({ message: "fileRef extension does not match media type" });
    }
    const mediaPayload = {};
    for (const key of ["fileRef", "altEn", "altAr", "captionEn", "captionAr"]) {
      if (Object.hasOwn(req.body, key)) mediaPayload[key] = req.body[key];
    }
    const updated = await patchSectionMedia(
      current.id,
      loaded.section.id,
      mediaPayload,
    );
    return res.status(200).json({ media: serializeSectionMedia(updated) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update section media" });
  }
};

export const reorderSectionMediaController = async (req, res) => {
  try {
    const loaded = await loadSection(req.params.id);
    if (loaded.error) return respondLoadError(res, loaded.error);
    const slot = getTemplateMediaSlot(loaded.section.template_key, req.body.slot);
    if (!slot) return res.status(400).json({ message: "Unknown media slot" });
    const reordered = await reorderSectionMedia(
      loaded.section.id,
      slot.key,
      req.body.media.map(({ id, position }) => ({ id, position })),
    );
    return res.status(200).json({ media: serializeSectionMediaList(reordered) });
  } catch (error) {
    if (error?.code === "CMS_MEDIA_REORDER_MISMATCH") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to reorder section media" });
  }
};

export const deleteSectionMediaController = async (req, res) => {
  try {
    const loaded = await loadSection(req.params.id);
    if (loaded.error) return respondLoadError(res, loaded.error);
    const current = await getSectionMediaById(req.params.mediaId);
    if (!current || Number(current.section_id) !== Number(loaded.section.id)) {
      return res.status(404).json({ message: "Media item not found" });
    }
    const slot = getTemplateMediaSlot(loaded.section.template_key, current.slot_key);
    if (!slot) return res.status(409).json({ message: "Unknown media slot" });
    const items = await listSectionMediaSlot(loaded.section.id, slot.key);
    if (slot.required && items.length <= 1) {
      return res.status(409).json({ message: "Required media cannot be removed" });
    }
    await deleteSectionMedia(current.id, loaded.section.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove section media" });
  }
};
