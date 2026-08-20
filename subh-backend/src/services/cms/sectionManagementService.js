import pool from "../../config/db.js";
import { hasSectionTemplate } from "../../cms/sectionTemplateRegistry.js";
import { upsertSectionContentRecords } from "../../models/sectionContent.Model.js";
import {
  insertSectionMedia,
  listSectionMedia,
} from "../../models/sectionMedia.Model.js";
import {
  copySectionContentRecords,
  copySectionMediaReferences,
  insertSectionInstanceRecord,
  listPageSectionsForUpdate,
  lockPageForSectionManagement,
  lockSectionWithPageForUpdate,
  setContiguousSectionPositions,
} from "../../models/section.Model.js";
import { bootstrapLegacySection } from "./legacySectionBootstrapService.js";
import { validateInitialMediaForTemplate } from "../../validation/sectionManagement.Validation.js";

const defaultDependencies = {
  pool,
  bootstrapLegacySection,
  copySectionContentRecords,
  copySectionMediaReferences,
  insertSectionInstanceRecord,
  insertSectionMedia,
  listSectionMedia,
  listPageSectionsForUpdate,
  lockPageForSectionManagement,
  lockSectionWithPageForUpdate,
  setContiguousSectionPositions,
  upsertSectionContentRecords,
};

const cmsError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

export const runSectionManagementTransaction = async (
  operation,
  poolProvider = pool,
) => {
  const client = await poolProvider.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const safeInsertionPosition = (requested, sectionCount) => {
  if (requested === undefined || requested === null) return sectionCount;
  return Math.min(Math.max(requested, 0), sectionCount);
};

const insertInitialMedia = async (sectionId, media, client, dependencies) => {
  const positionsBySlot = new Map();
  for (const item of media) {
    const position = positionsBySlot.get(item.slot) || 0;
    await dependencies.insertSectionMedia(
      sectionId,
      { ...item, position },
      client,
    );
    positionsBySlot.set(item.slot, position + 1);
  }
};

export const createSectionInstance = async (payload, overrides = {}) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  if (!hasSectionTemplate(payload.templateKey)) {
    throw cmsError("Section template is not registered", "CMS_TEMPLATE_UNKNOWN");
  }

  return runSectionManagementTransaction(async (client) => {
    const page = await dependencies.lockPageForSectionManagement(
      payload.pageId,
      client,
    );
    if (!page) throw cmsError("Page not found", "CMS_PAGE_NOT_FOUND");

    const current = await dependencies.listPageSectionsForUpdate(
      payload.pageId,
      client,
    );
    const position = safeInsertionPosition(payload.position, current.length);
    const created = await dependencies.insertSectionInstanceRecord(
      {
        pageId: payload.pageId,
        templateKey: payload.templateKey,
        position: current.length,
        isVisible: false,
      },
      client,
    );
    const orderedIds = current.map(({ id }) => id);
    orderedIds.splice(position, 0, created.id);
    await dependencies.setContiguousSectionPositions(
      payload.pageId,
      orderedIds,
      client,
    );

    const records = [
      ...(payload.contentRecords || []),
      ...(payload.appearanceRecords || []),
    ];
    if (records.length > 0) {
      await dependencies.upsertSectionContentRecords(created.id, records, client);
    }
    await insertInitialMedia(created.id, payload.media || [], client, dependencies);
    return { ...created, position };
  }, dependencies.pool);
};

export const duplicateSectionInstance = async (
  sectionId,
  { position } = {},
  overrides = {},
) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  return runSectionManagementTransaction(async (client) => {
    const source = await dependencies.lockSectionWithPageForUpdate(
      sectionId,
      client,
    );
    if (!source) throw cmsError("Section not found", "CMS_SECTION_NOT_FOUND");
    if (!hasSectionTemplate(source.template_key)) {
      throw cmsError("Section template is not registered", "CMS_TEMPLATE_UNKNOWN");
    }

    const current = await dependencies.listPageSectionsForUpdate(
      source.page_id,
      client,
    );
    await dependencies.bootstrapLegacySection(source, client);
    const sourceMedia = await dependencies.listSectionMedia(source.id, client);
    const mediaValidation = validateInitialMediaForTemplate(
      source.template_key,
      sourceMedia.map((item) => ({
        slot: item.slot_key,
        mediaType: item.media_type,
        fileRef: item.file_ref,
        altEn: item.alt_en,
        altAr: item.alt_ar,
        captionEn: item.caption_en,
        captionAr: item.caption_ar,
      })),
    );
    if (!mediaValidation.ok) {
      throw cmsError(
        `Source media is not safe to duplicate: ${mediaValidation.errors.join("; ")}`,
        "CMS_MEDIA_INVALID",
      );
    }
    const sourceIndex = current.findIndex(
      ({ id }) => Number(id) === Number(source.id),
    );
    if (sourceIndex < 0) {
      throw cmsError(
        "Source section does not belong to its page",
        "CMS_SECTION_REORDER_MISMATCH",
      );
    }
    const insertAt = safeInsertionPosition(position ?? sourceIndex + 1, current.length);
    const duplicate = await dependencies.insertSectionInstanceRecord(
      {
        pageId: source.page_id,
        templateKey: source.template_key,
        position: current.length,
        isVisible: false,
      },
      client,
    );
    await dependencies.copySectionContentRecords(source.id, duplicate.id, client);
    await dependencies.copySectionMediaReferences(source.id, duplicate.id, client);
    const orderedIds = current.map(({ id }) => id);
    orderedIds.splice(insertAt, 0, duplicate.id);
    await dependencies.setContiguousSectionPositions(
      source.page_id,
      orderedIds,
      client,
    );
    return { ...duplicate, position: insertAt };
  }, dependencies.pool);
};

export const reorderSectionInstances = async (
  pageId,
  orderedSectionIds,
  overrides = {},
) => {
  const dependencies = { ...defaultDependencies, ...overrides };
  return runSectionManagementTransaction(async (client) => {
    const page = await dependencies.lockPageForSectionManagement(pageId, client);
    if (!page) throw cmsError("Page not found", "CMS_PAGE_NOT_FOUND");
    const current = await dependencies.listPageSectionsForUpdate(pageId, client);
    const currentIds = current.map(({ id }) => Number(id)).sort((a, b) => a - b);
    const submittedIds = orderedSectionIds.map(Number).sort((a, b) => a - b);
    if (
      new Set(orderedSectionIds.map(Number)).size !== orderedSectionIds.length ||
      currentIds.length !== submittedIds.length ||
      currentIds.some((id, index) => id !== submittedIds[index])
    ) {
      throw cmsError(
        "Reorder payload must include every page section exactly once",
        "CMS_SECTION_REORDER_MISMATCH",
      );
    }
    await dependencies.setContiguousSectionPositions(
      pageId,
      orderedSectionIds,
      client,
    );
    return orderedSectionIds.map(Number);
  }, dependencies.pool);
};
