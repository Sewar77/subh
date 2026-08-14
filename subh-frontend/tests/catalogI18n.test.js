import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCatalogNumber,
  formatActiveFilterLabel,
  getCatalogCountLabel,
  getCatalogCopy,
} from "../src/Utils/catalogI18n.js";

test("provides complete shared catalog hero and toolbar copy", () => {
  for (const language of ["en", "ar"]) {
    const copy = getCatalogCopy(language);
    for (const key of [
      "booksTitle",
      "booksDescription",
      "categoriesTitle",
      "categoriesDescription",
      "categoryBooksDescription",
      "catalogFilters",
      "activeFilters",
      "clearFilters",
    ]) {
      assert.ok(copy[key], `${language}.${key} is required`);
    }
  }
});

test("formats catalog counts using English and Arabic numerals", () => {
  assert.equal(formatCatalogNumber(12, "en"), "12");
  assert.match(formatCatalogNumber(12, "ar"), /١٢/);
});

test("uses localized singular and plural count labels", () => {
  assert.equal(getCatalogCountLabel("books", 1, "en"), "book");
  assert.equal(getCatalogCountLabel("books", 2, "en"), "books");
  assert.equal(getCatalogCountLabel("books", 2, "ar"), "كتاب");
  assert.equal(getCatalogCountLabel("categories", 5, "ar"), "تصنيفات");
  assert.equal(formatActiveFilterLabel(1, "en"), "1 active filter");
  assert.match(formatActiveFilterLabel(2, "ar"), /٢ عوامل تصفية مفعّلة/);
});

test("Arabic shared catalog copy contains no Latin UI fallback", () => {
  const copy = getCatalogCopy("ar");
  for (const key of [
    "booksTitle",
    "categoriesTitle",
    "catalogFilters",
    "activeFilters",
  ]) {
    assert.doesNotMatch(copy[key], /[A-Za-z]/);
  }
});
