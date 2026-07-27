import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeAdminSection,
  normalizeCmsError,
} from "../src/Services/cmsService.js";

test("normalizes admin section and media response aliases", () => {
  const section = normalizeAdminSection({
    id: 10,
    page_id: 2,
    type: "hero",
    position: "3",
    is_visible: false,
    is_archived: true,
    content: { title: { en: "Welcome", ar: "مرحبا" } },
    media: [
      {
        media_id: 7,
        section_id: 10,
        role: "background",
        media_type: "image",
        url: "/uploads/hero.jpg",
        position: "1",
        alt_en: "Books",
      },
    ],
    editingSchema: {
      fields: [{ key: "title", localized: true }],
      mediaSlots: [{ key: "background", mediaTypes: ["image"] }],
    },
  });

  assert.equal(section.pageId, 2);
  assert.equal(section.templateKey, "hero");
  assert.equal(section.position, 3);
  assert.equal(section.isVisible, false);
  assert.equal(section.isArchived, true);
  assert.equal(section.media[0].id, 7);
  assert.equal(section.media[0].slot, "background");
  assert.equal(section.media[0].fileRef, "/uploads/hero.jpg");
  assert.equal(section.editingSchema.fields[0].key, "title");
});

test("normalizes backend content errors into field paths", () => {
  const error = normalizeCmsError({
    response: {
      status: 400,
      data: {
        message: "Invalid section content",
        errors: [
          "title.en must not exceed 160 characters",
          "buttonLink must be an approved link",
          "Unknown content field: component",
        ],
      },
    },
  });

  assert.equal(error.status, 400);
  assert.deepEqual(error.fieldErrors["title.en"], [
    "title.en must not exceed 160 characters",
  ]);
  assert.deepEqual(error.fieldErrors.buttonLink, [
    "buttonLink must be an approved link",
  ]);
  assert.deepEqual(error.fieldErrors._general, [
    "Unknown content field: component",
  ]);
});

test("uses validation details when the backend omits a message", () => {
  const error = normalizeCmsError({
    response: {
      status: 400,
      data: {
        errors: [{ field: "content", message: "content is required" }],
      },
    },
  });

  assert.equal(error.message, "content is required");
  assert.deepEqual(error.fieldErrors.content, ["content is required"]);
});
