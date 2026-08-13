import { getAdminEditingMetadata } from "../cms/sectionTemplateRegistry.js";
import {
  archiveSection,
  getAllSections,
  getPublicSectionsByPageId,
  getSectionForAdmin,
  getSectionsByPageKey,
  reorderPageSections,
  restoreSection,
  toggleSectionVisibility,
  updateSectionVisibility,
} from "../models/section.Model.js";
import {
  hydrateSection,
  hydrateSections,
} from "../services/cms/sectionReadService.js";
import { getValidated } from "../middleware/validate.Middleware.js";

export const getSectionTemplatesController = async (req, res) =>
  res.status(200).json({ templates: getAdminEditingMetadata() });

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
      await getPublicSectionsByPageId(getValidated(req, "params").page_id),
      { locale: getValidated(req, "query").lang },
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
      { locale: getValidated(req, "query").lang },
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
    const rows = await reorderPageSections(
      getValidated(req, "params").pageId,
      getValidated(req, "body").sections.map(({ id, position }) => ({ id, position })),
    );
    const sections = await hydrateSections(rows, { admin: true });
    return res.status(200).json({ success: true, sections });
  } catch (error) {
    if (error?.code === "CMS_SECTION_REORDER_MISMATCH") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to reorder sections" });
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
