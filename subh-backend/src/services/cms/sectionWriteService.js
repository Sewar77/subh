import pool from "../../config/db.js";
import { upsertSectionContentRecords } from "../../models/sectionContent.Model.js";
import { upsertFirstMediaInSlot } from "../../models/sectionMedia.Model.js";
import { lockSectionForUpdate } from "../../models/section.Model.js";
import { bootstrapLegacySection } from "./legacySectionBootstrapService.js";

const runSectionTransaction = async (section, operation) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const locked = await lockSectionForUpdate(section.id, client);
    if (!locked) {
      const error = new Error("Section not found");
      error.code = "CMS_SECTION_NOT_FOUND";
      throw error;
    }
    await bootstrapLegacySection(section, client);
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

export const writeStructuredContentPatch = async (section, records) =>
  runSectionTransaction(section, (client) =>
    upsertSectionContentRecords(section.id, records, client),
  );

export const writeLegacyCompatibilityPatch = async (
  section,
  records,
  mediaPayload,
) =>
  runSectionTransaction(section, async (client) => {
    if (records.length > 0) {
      await upsertSectionContentRecords(section.id, records, client);
    }
    if (mediaPayload) {
      await upsertFirstMediaInSlot(section.id, mediaPayload, client);
    }
  });
