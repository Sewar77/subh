import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getAdminEditingMetadata,
  getAppearanceStorageKey,
} from "../src/cms/sectionTemplateRegistry.js";
import sectionRouter from "../src/routes/section.Routes.js";
import { adminOnly } from "../src/middleware/adminOnly.Middleware.js";
import { protect } from "../src/middleware/protect.Middleware.js";
import {
  createSectionInstance,
  duplicateSectionInstance,
  reorderSectionInstances,
} from "../src/services/cms/sectionManagementService.js";
import { serializePublicSection } from "../src/utils/sectionSerializer.js";
import {
  validateAppearanceForTemplate,
  validateContentPatchForTemplate,
} from "../src/validation/sectionContent.Validation.js";
import {
  sectionCreateSchema,
  validateInitialMediaForTemplate,
} from "../src/validation/sectionManagement.Validation.js";

const makeHarness = (overrides = {}) => {
  const commands = [];
  const calls = {};
  const client = {
    query: async (sql) => {
      commands.push(String(sql));
      return { rows: [], rowCount: 0 };
    },
    release: () => {
      calls.released = true;
    },
  };
  const dependencies = {
    pool: { connect: async () => client },
    lockPageForSectionManagement: async () => ({ id: 1, key: "home" }),
    listPageSectionsForUpdate: async () => [{ id: 10 }, { id: 20 }],
    insertSectionInstanceRecord: async (payload) => {
      calls.insert = payload;
      return { id: 30, page_id: payload.pageId, template_key: payload.templateKey };
    },
    setContiguousSectionPositions: async (pageId, ids) => {
      calls.order = { pageId, ids };
    },
    upsertSectionContentRecords: async (sectionId, records) => {
      calls.content = { sectionId, records };
    },
    insertSectionMedia: async (sectionId, media) => {
      calls.media ||= [];
      calls.media.push({ sectionId, media });
    },
    lockSectionWithPageForUpdate: async () => ({
      id: 20,
      page_id: 1,
      template_key: "hero",
      position: 1,
    }),
    bootstrapLegacySection: async () => {
      calls.bootstrapped = true;
    },
    listSectionMedia: async () => [],
    copySectionContentRecords: async (sourceId, targetId) => {
      calls.copiedContent = { sourceId, targetId };
    },
    copySectionMediaReferences: async (sourceId, targetId) => {
      calls.copiedMedia = { sourceId, targetId };
    },
    ...overrides,
  };
  return { calls, commands, dependencies };
};

const templates = getAdminEditingMetadata();
assert.equal(templates.length, 8);
for (const template of templates) {
  assert.equal(typeof template.name, "string");
  assert.equal(typeof template.description, "string");
  assert.ok(Array.isArray(template.fields));
  assert.ok(Array.isArray(template.mediaSlots));
  assert.ok(Array.isArray(template.appearance));
  assert.equal(Object.hasOwn(template, "component"), false);
}
assert.deepEqual(
  getAdminEditingMetadata("hero").variants,
  ["centered", "split", "minimal"],
);
assert.equal(getAppearanceStorageKey("contentWidth"), "appearanceContentWidth");

const validCreate = sectionCreateSchema.validate({
  templateKey: "hero",
  position: 1,
  content: { title: { en: "Hello", ar: "Welcome" } },
  appearance: { variant: "centered" },
  media: [{
    slot: "background",
    mediaType: "image",
    fileRef: "https://cdn.example.test/hero.webp",
  }],
});
assert.equal(validCreate.error, undefined);
assert.ok(sectionCreateSchema.validate({ templateKey: "hero", role: "admin" }).error);
assert.equal(
  validateContentPatchForTemplate("hero", validCreate.value.content).ok,
  true,
);
assert.equal(
  validateAppearanceForTemplate("hero", validCreate.value.appearance).ok,
  true,
);
assert.equal(
  validateAppearanceForTemplate("hero", { arbitraryCss: "display:none" }).ok,
  false,
);
assert.equal(
  validateAppearanceForTemplate("text", { imageFit: "cover" }).ok,
  false,
);
assert.equal(
  validateAppearanceForTemplate("hero", { variant: "invented" }).ok,
  false,
);
assert.equal(
  validateInitialMediaForTemplate("hero", validCreate.value.media).ok,
  true,
);
assert.equal(
  validateInitialMediaForTemplate("text", validCreate.value.media).ok,
  false,
);

const createHarness = makeHarness();
const created = await createSectionInstance({
  pageId: 1,
  templateKey: "hero",
  position: 1,
  contentRecords: [{ locale: "en", fieldKey: "title", fieldValue: "Hello", fieldType: "text" }],
  appearanceRecords: [{ locale: "neutral", fieldKey: "appearanceVariant", fieldValue: "centered", fieldType: "text" }],
  media: validCreate.value.media,
}, createHarness.dependencies);
assert.equal(created.id, 30);
assert.equal(createHarness.calls.insert.isVisible, false);
assert.deepEqual(createHarness.calls.order.ids, [10, 30, 20]);
assert.equal(createHarness.calls.content.records.length, 2);
assert.equal(createHarness.calls.media[0].media.position, 0);
assert.ok(createHarness.commands.includes("BEGIN"));
assert.ok(createHarness.commands.includes("COMMIT"));
assert.equal(createHarness.calls.released, true);

let invalidTemplateError;
try {
  await createSectionInstance({ pageId: 1, templateKey: "unknown" });
} catch (error) {
  invalidTemplateError = error;
}
assert.equal(invalidTemplateError?.code, "CMS_TEMPLATE_UNKNOWN");

const duplicateHarness = makeHarness();
const duplicate = await duplicateSectionInstance(
  20,
  {},
  duplicateHarness.dependencies,
);
assert.equal(duplicate.id, 30);
assert.equal(duplicateHarness.calls.bootstrapped, true);
assert.deepEqual(duplicateHarness.calls.copiedContent, { sourceId: 20, targetId: 30 });
assert.deepEqual(duplicateHarness.calls.copiedMedia, { sourceId: 20, targetId: 30 });
assert.deepEqual(duplicateHarness.calls.order.ids, [10, 20, 30]);
assert.equal(duplicateHarness.calls.insert.isVisible, false);

const unsafeMediaHarness = makeHarness({
  listSectionMedia: async () => [
    { slot_key: "background", media_type: "image", file_ref: "/one.webp" },
    { slot_key: "background", media_type: "image", file_ref: "/two.webp" },
  ],
});
let unsafeMediaError;
try {
  await duplicateSectionInstance(20, {}, unsafeMediaHarness.dependencies);
} catch (error) {
  unsafeMediaError = error;
}
assert.equal(unsafeMediaError?.code, "CMS_MEDIA_INVALID");
assert.equal(unsafeMediaHarness.calls.copiedMedia, undefined);
assert.ok(unsafeMediaHarness.commands.includes("ROLLBACK"));

const reorderHarness = makeHarness();
assert.deepEqual(
  await reorderSectionInstances(1, [20, 10], reorderHarness.dependencies),
  [20, 10],
);
assert.deepEqual(reorderHarness.calls.order.ids, [20, 10]);

for (const invalidOrder of [[10], [10, 10], [10, 99]]) {
  const harness = makeHarness();
  let mismatch;
  try {
    await reorderSectionInstances(1, invalidOrder, harness.dependencies);
  } catch (error) {
    mismatch = error;
  }
  assert.equal(mismatch?.code, "CMS_SECTION_REORDER_MISMATCH");
  assert.ok(harness.commands.includes("ROLLBACK"));
  assert.equal(harness.commands.includes("COMMIT"), false);
  assert.equal(harness.calls.released, true);
}

const failingHarness = makeHarness({
  setContiguousSectionPositions: async () => {
    throw new Error("simulated ordering failure");
  },
});
await assert.rejects(
  () => reorderSectionInstances(1, [20, 10], failingHarness.dependencies),
  /simulated ordering failure/,
);
assert.ok(failingHarness.commands.includes("ROLLBACK"));
assert.equal(failingHarness.commands.includes("COMMIT"), false);

const mutationPaths = [
  ["post", "/pages/:pageId/sections"],
  ["post", "/sections/:id/duplicate"],
  ["patch", "/pages/:pageId/sections/reorder"],
  ["patch", "/sections/:id/visibility"],
  ["patch", "/sections/:id/archive"],
  ["patch", "/sections/:id/restore"],
  ["patch", "/sections/:id/appearance"],
];
for (const [method, routePath] of mutationPaths) {
  const layer = sectionRouter.stack.find(
    (item) => item.route?.path === routePath && item.route.methods[method],
  );
  assert.ok(layer, `${method.toUpperCase()} ${routePath} is missing`);
  const handlers = layer.route.stack.map(({ handle }) => handle.name);
  assert.ok(handlers.includes("protect"), `${routePath} lacks 401 authentication boundary`);
  assert.ok(handlers.includes("adminOnly"), `${routePath} lacks 403 administrator boundary`);
}

const responseProbe = () => {
  const result = { statusCode: null, body: null };
  return {
    result,
    response: {
      status(code) {
        result.statusCode = code;
        return this;
      },
      json(body) {
        result.body = body;
        return this;
      },
    },
  };
};
let probe = responseProbe();
await protect({ cookies: {} }, probe.response, () => assert.fail("anonymous request advanced"));
assert.equal(probe.result.statusCode, 401);
probe = responseProbe();
adminOnly({ user: { role: "user" } }, probe.response, () => assert.fail("normal user advanced"));
assert.equal(probe.result.statusCode, 403);
probe = responseProbe();
let adminAdvanced = false;
adminOnly({ user: { role: "admin" } }, probe.response, () => {
  adminAdvanced = true;
});
assert.equal(adminAdvanced, true);

const publicSection = serializePublicSection(
  { id: 1, template_key: "hero", position: 0 },
  { title: "Hello" },
  [],
  { variant: "centered" },
);
assert.deepEqual(Object.keys(publicSection), [
  "id",
  "templateKey",
  "position",
  "content",
  "media",
  "appearance",
]);
for (const privateKey of [
  "isVisible",
  "isArchived",
  "editingSchema",
  "translations",
  "createdAt",
  "updatedAt",
]) {
  assert.equal(Object.hasOwn(publicSection, privateKey), false);
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sectionModelSource = fs.readFileSync(
  path.resolve(scriptDirectory, "../src/models/section.Model.js"),
  "utf8",
);
const pagesModelSource = fs.readFileSync(
  path.resolve(scriptDirectory, "../src/models/pages.Models.js"),
  "utf8",
);
for (const source of [sectionModelSource, pagesModelSource]) {
  assert.match(source, /is_visible = true/);
  assert.match(source, /COALESCE\(s\.is_archived, false\) = false/);
}
assert.match(
  sectionModelSource,
  /updateSectionVisibility[\s\S]*SET is_visible = \$2/,
);
assert.match(
  sectionModelSource,
  /archiveSection[\s\S]*SET is_archived = true/,
);
assert.match(
  sectionModelSource,
  /restoreSection[\s\S]*SET is_archived = false/,
);
const archiveImplementation = sectionModelSource.slice(
  sectionModelSource.indexOf("export const archiveSection"),
  sectionModelSource.indexOf("export const restoreSection"),
);
assert.doesNotMatch(archiveImplementation, /DELETE FROM sections/i);
assert.doesNotMatch(sectionRouter.stack.map((layer) => layer.route?.path).join("\n"), /templates\/:|pages\/create|pages\/:id\/delete/);

console.log("Section management verification passed");
process.exit(0);
