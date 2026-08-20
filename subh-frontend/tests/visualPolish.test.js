import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("catalog grids use stable centered geometry and category actions share one row", () => {
  const books = readSource("src/components/Books/BookCardGrid.jsx");
  const categories = readSource("src/Pages/Categories/CategoriesPage.jsx");
  const categoryCard = readSource("src/components/Categories/CategoryCard.jsx");

  assert.match(books, /repeat\(auto-fit, minmax\(min\(100%, 290px\), 330px\)\)/);
  assert.match(books, /justifyContent: "center"/);
  assert.match(categories, /repeat\(auto-fit, minmax\(min\(100%, 300px\), 380px\)\)/);
  assert.match(categoryCard, /<Stack direction="row" spacing=\{1\} width="100%">/);
});

test("Category Edit preloads the bilingual admin record and keeps the existing image", () => {
  const update = readSource("src/components/Admin/Manage/ManageCategories/UpdateCategory.jsx");
  const form = readSource("src/components/Admin/Manage/ManageCategories/CategoryForm.jsx");

  assert.match(update, /getAdminCategory\(id\)/);
  assert.doesNotMatch(update, /getCategory as getCategoryById/);
  for (const field of ["nameEn", "nameAr", "descriptionEn", "descriptionAr", "image"]) {
    assert.match(form, new RegExp(`initialCategory\\.${field}`));
  }
  assert.match(form, /value=\{form\.image \? \{ url: form\.image \} : null\}/);
});

test("CMS templates use semantic compact sections and controlled responsive media", () => {
  const hero = readSource("src/Sections/HeroSection.jsx");
  const imageText = readSource("src/Sections/ImageTextSection.jsx");
  const text = readSource("src/Sections/TextSection.jsx");
  const media = readSource("src/Sections/MediaSection.jsx");
  const banner = readSource("src/Sections/BannerSection.jsx");

  for (const source of [hero, imageText, text, media, banner]) assert.match(source, /component="section"/);
  assert.match(imageText, /maxWidth: 1120/);
  assert.match(imageText, /textAlign: "start"/);
  assert.match(media, /loading=\{section\.priority && index === 0 \? "eager" : "lazy"\}/);
  assert.match(banner, /minHeight: 42/);
});

test("Contact guidance uses the existing support channel without a fake form", () => {
  const contact = readSource("src/components/Contact/Contact.jsx");
  assert.match(contact, /mailto:contact@subh\.com/);
  assert.doesNotMatch(contact, /TextField|component="form"/);
  assert.match(contact, /dir=\{isArabic \? "rtl" : "ltr"\}/);
});
