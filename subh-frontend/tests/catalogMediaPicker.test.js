import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDirectory, "..");
const readSource = (relativePath) =>
  fs.readFileSync(path.join(frontendRoot, relativePath), "utf8");

const bookForm = readSource("src/components/Admin/Manage/ManageBooks/BookEditorForm.jsx");
const categoryForm = readSource("src/components/Admin/Manage/ManageCategories/CategoryForm.jsx");
const picker = readSource("src/components/Admin/Media/MediaPicker.jsx");
const mediaService = readSource("src/Services/mediaAssetService.js");
const bookCover = readSource("src/components/Books/BookCoverImage.jsx");
const bookCard = readSource("src/components/Books/BookCardGrid.jsx");
const bookDetail = readSource("src/Pages/Books/BookDetailPage.jsx");

test("Book cover and barcode fields reuse MediaPicker and submit URLs only", () => {
  assert.match(bookForm, /<MediaPicker/);
  assert.match(bookForm, /label="Cover image"/);
  assert.match(bookForm, /label="Barcode image"/);
  assert.match(bookForm, /onSelect=\{\(asset\) => onChange\(asset\.url\)\}/);
  assert.match(bookForm, /coverImage: values\.coverImage\.trim\(\) \|\| null/);
  assert.match(bookForm, /barcodeImage: values\.barcodeImage\.trim\(\) \|\| null/);
  assert.doesNotMatch(bookForm, /asset\.id|publicId|uploader|dimensions/);
});

test("Category form reuses MediaPicker and preserves legacy image URLs", () => {
  assert.match(categoryForm, /<MediaPicker/);
  assert.match(categoryForm, /value=\{form\.image \? \{ url: form\.image \} : null\}/);
  assert.match(categoryForm, /image: asset\.url/);
  assert.doesNotMatch(categoryForm, /asset\.id|publicId|uploadCategoryImage/);
});

test("new uploads use Media Library while existing selection never uploads", () => {
  assert.match(mediaService, /api\.post\("\/admin\/media-assets\/upload"/);
  const selection = picker.slice(picker.indexOf("const select"), picker.indexOf("return ("));
  assert.match(selection, /await onSelect\(asset\)/);
  assert.doesNotMatch(selection, /uploadMediaAsset/);
});

test("Book presentation uses the shared stable two-to-three cover rule", () => {
  assert.match(bookCover, /aspectRatio: "2 \/ 3"/);
  assert.match(bookCover, /card: \{ width: "100%", objectFit: "cover" \}/);
  assert.match(bookCover, /detail: \{ width: "min\(100%, 360px\)", objectFit: "contain" \}/);
  assert.match(bookCover, /loading = "lazy"/);
  assert.match(bookCard, /<BookCoverImage/);
  assert.match(bookDetail, /variant="detail"/);
  assert.match(bookDetail, /loading="eager"/);
});

