import { getSectionTemplate } from "../cms/sectionTemplateRegistry.js";
import { getSectionForAdmin } from "../models/section.Model.js";
import { hydrateSection } from "../services/cms/sectionReadService.js";
import { writeStructuredContentPatch } from "../services/cms/sectionWriteService.js";
import { validateContentPatchForTemplate } from "../validation/sectionContent.Validation.js";
import { getValidated } from "../middleware/validate.Middleware.js";

const loadEditableSection = async (id) => {
  const section = await getSectionForAdmin(id);
  if (!section) return { error: "not_found" };
  const template = getSectionTemplate(section.template_key);
  if (!template) return { error: "unknown_template" };
  return { section, template };
};

export const getSectionContentController = async (req, res) => {
  try {
    const loaded = await loadEditableSection(getValidated(req, "params").id);
    if (loaded.error === "not_found") {
      return res.status(404).json({ message: "Section not found" });
    }
    if (loaded.error) {
      return res.status(409).json({ message: "Section template is not registered" });
    }
    const section = await hydrateSection(loaded.section, { admin: true });
    return res.status(200).json({ content: section.content });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch section content" });
  }
};

export const patchSectionContentController = async (req, res) => {
  try {
    const loaded = await loadEditableSection(getValidated(req, "params").id);
    if (loaded.error === "not_found") {
      return res.status(404).json({ message: "Section not found" });
    }
    if (loaded.error) {
      return res.status(409).json({ message: "Section template is not registered" });
    }

    const validation = validateContentPatchForTemplate(
      loaded.section.template_key,
      getValidated(req, "body").content,
    );
    if (!validation.ok) {
      return res.status(400).json({ message: "Invalid section content", errors: validation.errors });
    }

    await writeStructuredContentPatch(loaded.section, validation.records);
    const section = await hydrateSection(loaded.section, { admin: true });
    return res.status(200).json({ message: "Section content updated", section });
  } catch (error) {
    if (error?.code === "CMS_LEGACY_CONTENT_INVALID") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to update section content" });
  }
};
