import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getAdminEditingMetadata,
  getTemplateField,
  getTemplateMediaSlot,
  hasSectionTemplate,
  validateRegistryIntegrity,
} from "../src/cms/sectionTemplateRegistry.js";
import sectionRouter from "../src/routes/section.Routes.js";
import translationRouter from "../src/routes/sectionTranslation.Routes.js";
import uploadRouter from "../src/routes/uploadImage.Routes.js";
import {
  buildStructuredTranslations,
  serializeSectionContentObject,
} from "../src/utils/sectionContentSerializer.js";
import {
  sectionContentPatchSchema,
  validateContentPatchForTemplate,
} from "../src/validation/sectionContent.Validation.js";
import { sectionMediaCreateSchema } from "../src/validation/sectionMedia.Validation.js";

const expectedTemplates = [
  "hero",
  "image",
  "text",
  "media",
  "image_text",
  "text_image",
  "banner",
  "summary",
];

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRegistrySource = fs.readFileSync(
  path.resolve(
    scriptDirectory,
    "../../subh-frontend/src/cms/sectionRegistry.js",
  ),
  "utf8",
);
const frontendRegistryBody = frontendRegistrySource.match(
  /SECTION_COMPONENTS\s*=\s*\{([\s\S]*?)\};/,
)?.[1];
assert.ok(frontendRegistryBody, "Frontend section registry was not found");
const frontendTemplates = [...frontendRegistryBody.matchAll(/^\s*([a-z][a-z0-9_]*):/gm)].map(
  ([, key]) => key,
);
assert.deepEqual(frontendTemplates, expectedTemplates);

assert.deepEqual(
  getAdminEditingMetadata().map(({ key }) => key),
  expectedTemplates,
);
assert.equal(validateRegistryIntegrity().ok, true);
assert.equal(hasSectionTemplate("hero"), true);
assert.equal(hasSectionTemplate("unknown"), false);
assert.equal(getTemplateField("hero", "title").localized, true);
assert.equal(getTemplateMediaSlot("image", "image").maxItems, 1);
assert.equal(getTemplateMediaSlot("image", "unknown"), null);
assert.equal(
  Object.hasOwn(getAdminEditingMetadata("hero"), "component"),
  false,
);

const envelope = sectionContentPatchSchema.validate({
  content: { title: { en: "Hello", ar: "مرحبا" } },
});
assert.equal(envelope.error, undefined);
assert.equal(
  validateContentPatchForTemplate("hero", envelope.value.content).ok,
  true,
);
assert.equal(
  validateContentPatchForTemplate("hero", {
    unknown: { en: "not allowed" },
  }).ok,
  false,
);
assert.equal(
  validateContentPatchForTemplate("hero", { title: { en: null } }).ok,
  false,
);
assert.equal(
  validateContentPatchForTemplate("hero", {
    buttonLink: "javascript:alert(1)",
  }).ok,
  false,
);

const records = [
  {
    section_id: 1,
    locale: "en",
    field_key: "title",
    field_value: "Title",
    field_type: "text",
  },
  {
    section_id: 1,
    locale: "ar",
    field_key: "title",
    field_value: "عنوان",
    field_type: "text",
  },
];
assert.deepEqual(serializeSectionContentObject(records).title, {
  en: "Title",
  ar: "عنوان",
});
assert.equal(
  buildStructuredTranslations(1, "hero", records, [
    { slot_key: "background", file_ref: "/uploads/hero.webp" },
  ])[0].content.image,
  "/uploads/hero.webp",
);

assert.equal(
  sectionMediaCreateSchema.validate({
    slot: "image",
    mediaType: "image",
    fileRef: "https://cdn.example.test/image.webp",
  }).error,
  undefined,
);
assert.ok(
  sectionMediaCreateSchema.validate({
    slot: "image",
    mediaType: "image",
    fileRef: "https://cdn.example.test/payload.svg",
  }).error,
);
assert.ok(
  sectionMediaCreateSchema.validate({
    slot: "image",
    mediaType: "image",
    fileRef: "https://cdn.example.test/video.mp4",
  }).error,
);

const assertCmsMutationsAreAdminOnly = (router) => {
  for (const layer of router.stack) {
    if (!layer.route) continue;
    const methods = Object.keys(layer.route.methods);
    if (!methods.some((method) => ["post", "put", "patch", "delete"].includes(method))) {
      continue;
    }
    const handlerNames = layer.route.stack.map(({ handle }) => handle.name);
    assert.ok(handlerNames.includes("protect"), `${layer.route.path} lacks protect`);
    assert.ok(handlerNames.includes("adminOnly"), `${layer.route.path} lacks adminOnly`);
  }
};

assertCmsMutationsAreAdminOnly(sectionRouter);
assertCmsMutationsAreAdminOnly(translationRouter);
assertCmsMutationsAreAdminOnly(uploadRouter);

console.log("CMS verification passed");
process.exit(0);
