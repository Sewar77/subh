import { getAdminEditingMetadata } from "../cms/sectionTemplateRegistry.js";
import {
  archiveSection,
  getAllSections,
  getSectionForAdmin,
  getSectionsByPageKey,
  listSectionsByPageId,
  restoreSection,
  toggleSectionVisibility,
  updateSectionVisibility,
} from "../models/section.Model.js";
import {
  createSectionInstance,
  duplicateSectionInstance,
  reorderSectionInstances,
} from "../services/cms/sectionManagementService.js";
import { writeStructuredContentPatch } from "../services/cms/sectionWriteService.js";
import {
  hydrateSection,
  hydrateSections,
} from "../services/cms/sectionReadService.js";
import { getValidated } from "../middleware/validate.Middleware.js";
import {
  validateAppearanceForTemplate,
  validateContentPatchForTemplate,
} from "../validation/sectionContent.Validation.js";
import { validateInitialMediaForTemplate } from "../validation/sectionManagement.Validation.js";

const managementErrorResponse = (res, error, fallback) => {
  if (error?.code === "CMS_PAGE_NOT_FOUND") {
    return res.status(404).json({ message: "Page not found" });
  }
  if (error?.code === "CMS_SECTION_NOT_FOUND") {
    return res.status(404).json({ message: "Section not found" });
  }
  if (error?.code === "CMS_TEMPLATE_UNKNOWN") {
    return res.status(400).json({ message: "Section template is not registered" });
  }
  if (error?.code === "CMS_SECTION_REORDER_MISMATCH") {
    return res.status(409).json({ message: error.message });
  }
  if (error?.code === "CMS_LEGACY_CONTENT_INVALID") {
    return res.status(409).json({ message: error.message });
  }
  if (error?.code === "CMS_MEDIA_INVALID") {
    return res.status(409).json({ message: error.message });
  }
  return res.status(500).json({ message: fallback });
};

export const getSectionTemplatesController = async (req, res) =>
  res.status(200).json({ templates: getAdminEditingMetadata() });

export const createSectionController = async (req, res) => {
  const pageId = getValidated(req, "params").pageId;
  const payload = getValidated(req, "body");
  const contentValidation = validateContentPatchForTemplate(
    payload.templateKey,
    payload.content || {},
  );
  const appearanceValidation = validateAppearanceForTemplate(
    payload.templateKey,
    payload.appearance || {},
  );
  const mediaValidation = validateInitialMediaForTemplate(
    payload.templateKey,
    payload.media || [],
  );
  const errors = [
    ...contentValidation.errors,
    ...appearanceValidation.errors,
    ...mediaValidation.errors,
  ];
  if (errors.length > 0) {
    return res.status(400).json({ message: "Invalid section instance", errors });
  }

  try {
    const created = await createSectionInstance({
      pageId,
      templateKey: payload.templateKey,
      position: payload.position,
      contentRecords: contentValidation.records,
      appearanceRecords: appearanceValidation.records,
      media: mediaValidation.media,
    });
    const section = await hydrateSection(await getSectionForAdmin(created.id), {
      admin: true,
    });
    return res.status(201).json({
      message: "Section instance created",
      section,
    });
  } catch (error) {
    return managementErrorResponse(res, error, "Failed to create section");
  }
};

export const duplicateSectionController = async (req, res) => {
  try {
    const created = await duplicateSectionInstance(
      getValidated(req, "params").id,
      getValidated(req, "body"),
    );
    const section = await hydrateSection(await getSectionForAdmin(created.id), {
      admin: true,
    });
    return res.status(201).json({
      message: "Section duplicated",
      section,
    });
  } catch (error) {
    return managementErrorResponse(res, error, "Failed to duplicate section");
  }
};

export const updateSectionAppearanceController = async (req, res) => {
  const id = getValidated(req, "params").id;
  try {
    const existing = await getSectionForAdmin(id);
    if (!existing) return res.status(404).json({ message: "Section not found" });
    const validation = validateAppearanceForTemplate(
      existing.template_key,
      getValidated(req, "body").appearance,
    );
    if (!validation.ok) {
      return res.status(400).json({
        message: "Invalid section appearance",
        errors: validation.errors,
      });
    }
    await writeStructuredContentPatch(existing, validation.records);
    const section = await hydrateSection(await getSectionForAdmin(id), {
      admin: true,
    });
    return res.status(200).json({
      message: "Section appearance updated",
      section,
    });
  } catch (error) {
    return managementErrorResponse(
      res,
      error,
      "Failed to update section appearance",
    );
  }
};

export const getAllSectionsController = async (req, res) => {
  try {
    const sections = await hydrateSections(await getAllSections(), {
      admin: true,
    });
    return res.status(200).json({ success: true, sections });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch sections" });
  }
};

export const getSectionsByPageController = async (req, res) => {
  try {
    const sections = await hydrateSections(
      await listSectionsByPageId(getValidated(req, "params").page_id),
      { admin: true },
    );
    return res.status(200).json({ success: true, sections });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch page sections" });
  }
};

export const getSectionsByPageKeyController = async (req, res) => {
  try {
    const sections = await hydrateSections(
      await getSectionsByPageKey(getValidated(req, "params").key),
      { admin: true },
    );
    return res.status(200).json({ success: true, sections });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch page sections" });
  }
};

export const getSectionByIdController = async (req, res) => {
  try {
    const section = await hydrateSection(
      await getSectionForAdmin(getValidated(req, "params").id),
      { admin: true },
    );
    if (!section) return res.status(404).json({ message: "Section not found" });
    return res.status(200).json({ success: true, section });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch section" });
  }
};

export const updateSectionVisibilityController = async (req, res) => {
  try {
    const updated = await updateSectionVisibility(
      getValidated(req, "params").id,
      getValidated(req, "body").isVisible,
    );
    if (!updated) return res.status(404).json({ message: "Section not found" });
    const section = await hydrateSection(updated, { admin: true });
    return res.status(200).json({ success: true, section });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update visibility" });
  }
};

export const toggleSectionVisibilityController = async (req, res) => {
  try {
    const updated = await toggleSectionVisibility(getValidated(req, "params").id);
    if (!updated) return res.status(404).json({ message: "Section not found" });
    const section = await hydrateSection(updated, { admin: true });
    return res.status(200).json({ success: true, section });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update visibility" });
  }
};

export const reorderPageSectionsController = async (req, res) => {
  try {
    const body = getValidated(req, "body");
    const orderedSectionIds = body.sectionIds || [...body.sections]
      .sort((a, b) => a.position - b.position)
      .map(({ id }) => id);
    const pageId = getValidated(req, "params").pageId;
    await reorderSectionInstances(
      pageId,
      orderedSectionIds,
    );
    const rows = await listSectionsByPageId(pageId);
    const sections = await hydrateSections(rows, { admin: true });
    return res.status(200).json({ success: true, sections });
  } catch (error) {
    return managementErrorResponse(res, error, "Failed to reorder sections");
  }
};

const setArchiveState = async (req, res, action, message) => {
  try {
    const updated = await action(getValidated(req, "params").id);
    if (!updated) return res.status(404).json({ message: "Section not found" });
    const section = await hydrateSection(updated, { admin: true });
    return res.status(200).json({ success: true, section });
  } catch (error) {
    return res.status(500).json({ message });
  }
};

export const archiveSectionController = (req, res) =>
  setArchiveState(req, res, archiveSection, "Failed to archive section");

export const restoreSectionController = (req, res) =>
  setArchiveState(req, res, restoreSection, "Failed to restore section");
