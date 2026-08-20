import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { normalizeMediaAssetError } from "../src/Services/mediaAssetService.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDirectory, "..");
const readSource = (relativePath) =>
  fs.readFileSync(path.join(frontendRoot, relativePath), "utf8");

const appSource = readSource("src/App.jsx");
const sidebarSource = readSource("src/components/Admin/Layout/AdminSidebar.jsx");
const serviceSource = readSource("src/Services/mediaAssetService.js");
const pickerSource = readSource("src/components/Admin/Media/MediaPicker.jsx");
const browserSource = readSource("src/components/Admin/Media/MediaAssetBrowser.jsx");
const cmsPageSource = readSource("src/Pages/Admin/CmsAdminPage.jsx");

test("Media Library is a lazy protected admin route with sidebar navigation", () => {
  assert.match(appSource, /const AdminMediaLibraryPage = lazy/);
  assert.match(appSource, /path="media"/);
  assert.match(sidebarSource, /path: "\/admin\/media"/);
});

test("one service owns the complete Media Library endpoint surface", () => {
  for (const endpoint of [
    'api.get("/admin/media-assets"',
    "api.get(`/admin/media-assets/${id}`",
    'api.post("/admin/media-assets/upload"',
    "api.patch(`/admin/media-assets/${id}`",
    "api.patch(`/admin/media-assets/${id}/archive`",
    "api.patch(`/admin/media-assets/${id}/restore`",
  ]) {
    assert.ok(serviceSource.includes(endpoint), `${endpoint} is missing`);
  }
  assert.doesNotMatch(serviceSource, /cloudinary|publicId\s*:/i);
});

test("upload payload contains only the file and editable metadata", () => {
  const uploadSource = serviceSource.slice(
    serviceSource.indexOf("export const uploadMediaAsset"),
    serviceSource.indexOf("export const updateMediaAssetMetadata"),
  );
  assert.match(uploadSource, /formData\.append\("image", file\)/);
  assert.match(uploadSource, /"displayName", "altTextEn", "altTextAr"/);
  assert.doesNotMatch(uploadSource, /publicId|source|width|height|bytes|uploader/);
});

test("picker browses active paginated assets and selecting does not upload", () => {
  assert.match(pickerSource, /MediaAssetBrowser status="active"/);
  assert.match(browserSource, /listMediaAssets\(\{ page, limit: 20/);
  const selectSource = pickerSource.slice(
    pickerSource.indexOf("const select"),
    pickerSource.indexOf("return ("),
  );
  assert.match(selectSource, /await onSelect\(asset\)/);
  assert.doesNotMatch(selectSource, /uploadMediaAsset/);
});

test("CMS links selected Media Library URLs through existing media contracts", () => {
  const addSource = cmsPageSource.slice(
    cmsPageSource.indexOf("const handleAddMediaAsset"),
    cmsPageSource.indexOf("const handleReplaceMediaAsset"),
  );
  assert.match(addSource, /addSectionMedia\(target\.id/);
  assert.match(addSource, /fileRef: asset\.url/);
  assert.match(addSource, /altEn: asset\.altTextEn/);
  assert.doesNotMatch(addSource, /uploadCmsFile/);

  const replaceSource = cmsPageSource.slice(
    cmsPageSource.indexOf("const handleReplaceMediaAsset"),
    cmsPageSource.indexOf("const handleUpdateMedia"),
  );
  assert.match(replaceSource, /replaceSectionMedia\(target\.id, item\.id, asset\.url\)/);
  assert.doesNotMatch(replaceSource, /uploadCmsFile/);
});

test("Media Library errors stay specific without exposing transport internals", () => {
  const normalized = normalizeMediaAssetError({
    response: { status: 400, data: { message: "Unsupported image type" } },
  });
  assert.equal(normalized.status, 400);
  assert.equal(normalized.message, "Unsupported image type");
});

