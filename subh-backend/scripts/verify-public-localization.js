import assert from "node:assert/strict";
import { serializePublicBook } from "../src/utils/bookSerializer.js";
import { serializePublicCategory } from "../src/utils/categorySerializer.js";
import { serializePublicPage } from "../src/utils/pageSerializer.js";
import { serializePublicSection } from "../src/utils/sectionSerializer.js";
import { publicLocaleQuerySchema } from "../src/validation/publicLocale.Validation.js";

const defaultLocale = publicLocaleQuerySchema.validate({});
assert.equal(defaultLocale.error, undefined);
assert.equal(defaultLocale.value.lang, "en");
assert.equal(publicLocaleQuerySchema.validate({ lang: "ar" }).error, undefined);
assert.ok(publicLocaleQuerySchema.validate({ lang: "fr" }).error);

const category = serializePublicCategory({
  id: 1,
  name: "Children's books",
  description: "A selection for young readers",
  book_count: 2,
});
assert.deepEqual(Object.keys(category).sort(), ["bookCount", "createdAt", "description", "id", "image", "name"]);

const book = serializePublicBook({ id: 2, name: "A book", description: "Summary" });
assert.equal(book.name, "A book");
assert.equal("nameEn" in book, false);
assert.equal("descriptionAr" in book, false);

const section = serializePublicSection(
  { id: 3, template_key: "hero", position: 1, is_visible: true },
  { title: "Welcome" },
  [],
);
assert.deepEqual(Object.keys(section).sort(), ["content", "id", "media", "position", "templateKey"]);

const page = serializePublicPage({ id: 4, key: "home-page", name: "Home" }, [section]);
assert.equal(page.page.name, "Home");
assert.equal("nameEn" in page.page, false);

console.log("Public localization contract verification passed.");
