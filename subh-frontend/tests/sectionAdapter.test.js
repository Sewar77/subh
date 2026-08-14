import assert from "node:assert/strict";
import test from "node:test";
import { prepareSection } from "../src/Utils/sectionAdapter.js";

test("adapts the canonical localized public section contract", () => {
  const section = prepareSection(
    {
      id: 7,
      templateKey: "image_text",
      position: 2,
      content: { title: "About us", text: "Localized copy" },
      media: [
        {
          slot: "image",
          fileRef: "https://cdn.example.test/about.webp",
          alt: "About illustration",
        },
      ],
    },
    "en",
  );

  assert.equal(section.type, "image_text");
  assert.equal(section.title, "About us");
  assert.equal(section.text, "Localized copy");
  assert.equal(section.img, "https://cdn.example.test/about.webp");
  assert.equal(section.content.alt, "About illustration");
  assert.equal(Object.hasOwn(section, "translations"), false);
});

test("preserves narrow legacy translation compatibility", () => {
  const section = prepareSection(
    {
      id: 8,
      type: "text",
      translations: [
        {
          locale: "ar",
          is_visible: true,
          title: "عنوان",
          content: { text: "محتوى" },
        },
      ],
    },
    "ar",
  );

  assert.equal(section.templateKey, "text");
  assert.equal(section.title, "عنوان");
  assert.equal(section.content.text, "محتوى");
});

test("returns null for malformed sections", () => {
  assert.equal(prepareSection(null, "en"), null);
  assert.equal(prepareSection({ templateKey: "hero" }, "en"), null);
});
