import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDirectory, "..");
const readSource = (relativePath) =>
  fs.readFileSync(path.join(frontendRoot, relativePath), "utf8");

const appSource = readSource("src/App.jsx");
const mainSource = readSource("src/main.jsx");
const adminLayoutSource = readSource("src/Layout/AdminLayout.jsx");

test("substantial route elements are loaded through React.lazy", () => {
  const lazyImports = appSource.match(/lazy\(\s*(?:\(\)\s*=>|\n)/g) || [];
  assert.ok(lazyImports.length >= 20, "Expected route-level lazy imports");
  assert.match(appSource, /const AdminLayout = lazy/);
  assert.match(appSource, /const AdminRouteGuard = lazy/);
  assert.match(appSource, /const CmsAdminPage = lazy/);
  assert.match(appSource, /const DisplayBooks = lazy/);
  assert.match(appSource, /const BookDetailPage = lazy/);
  assert.match(appSource, /const CategoriesPage = lazy/);
  assert.match(appSource, /const AdminBookRequestsPage = lazy/);
  assert.match(appSource, /const AdminBookRequestDetailPage = lazy/);
  assert.match(appSource, /const BookRequestCreatePage = lazy/);
  assert.match(appSource, /const MyBookRequestsPage = lazy/);
});

test("direct and nested route paths remain registered", () => {
  for (const routePath of [
    "about",
    "login",
    "educational/courses",
    "categories",
    "categories/:id",
    "categories/:id/books",
    "books",
    "books/:id",
    "/admin",
    "cms/:pageId",
    "cms/:pageId/sections/:sectionId",
    "requests",
    "requests/:id",
    "request-books",
    "my-requests",
    "my-requests/:id",
  ]) {
    assert.ok(appSource.includes(`path="${routePath}"`), `${routePath} is missing`);
  }
});

test("admin-only providers are excluded from the public entry tree", () => {
  assert.doesNotMatch(mainSource, /UsersProvider|CategoriesProvider|PagesProvider/);
  assert.match(adminLayoutSource, /UsersProvider/);
  assert.match(adminLayoutSource, /CategoriesProvider/);
  assert.match(adminLayoutSource, /PagesProvider/);
});
