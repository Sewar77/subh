import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  formatRequestDate,
  formatRequestNumber,
  getBookRequestCopy,
  getRequestStatusLabel,
} from "../src/Utils/bookRequestI18n.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDirectory, "..");
const readSource = (relativePath) => fs.readFileSync(path.join(frontendRoot, relativePath), "utf8");

const appSource = readSource("src/App.jsx");
const guardSource = readSource("src/components/BookRequests/CustomerRouteGuard.jsx");
const builderSource = readSource("src/components/BookRequests/BookRequestBuilder.jsx");
const detailSource = readSource("src/components/BookRequests/CustomerRequestDetails.jsx");
const serviceSource = readSource("src/Services/customerBookRequestService.js");
const bookDetailSource = readSource("src/Pages/Books/BookDetailPage.jsx");
const loginHookSource = readSource("src/Hooks/useAuth.js");

test("customer request routes are lazy and protected", () => {
  for (const component of ["CustomerRouteGuard", "BookRequestCreatePage", "MyBookRequestsPage", "MyBookRequestDetailPage"]) {
    assert.match(appSource, new RegExp(`const ${component} = lazy`));
  }
  for (const route of ["request-books", "my-requests", "my-requests/:id"]) {
    assert.ok(appSource.includes(`path="${route}"`));
  }
  assert.match(guardSource, /authLoading/);
  assert.match(guardSource, /state=\{\{ from:/);
});

test("Book Detail starts a bulk request and login preserves safe return navigation", () => {
  assert.match(bookDetailSource, /requestBooks: "Request books"/);
  assert.match(bookDetailSource, /requestBooks: "طلب الكتب"/);
  assert.match(bookDetailSource, /to=\{`\/request-books\?bookId=\$\{book\.id\}`\}/);
  assert.match(loginHookSource, /safeReturnTo/);
  assert.match(loginHookSource, /!returnTo\.startsWith\("\/\/"\)/);
});

test("one customer service owns create, list, and detail endpoints with locale", () => {
  assert.match(serviceSource, /api\.post\("\/book-requests", payload, \{ params: \{ lang \} \}\)/);
  assert.match(serviceSource, /api\.get\("\/book-requests"/);
  assert.match(serviceSource, /api\.get\(`\/book-requests\/\$\{id\}`/);
  assert.match(serviceSource, /params: \{ lang \}/);
});

test("request creation constructs only customer-owned payload fields", () => {
  const payloadBlock = builderSource.slice(
    builderSource.indexOf("const payload = {"),
    builderSource.indexOf("setSubmitting(true)"),
  );
  assert.match(payloadBlock, /items:/);
  assert.match(payloadBlock, /shipping:/);
  assert.match(payloadBlock, /customerNote/);
  for (const forbidden of ["userId", "unitPrice", "shippingCost", "subtotal", "total", "requestStatus", "admin", "payment"]) {
    assert.doesNotMatch(payloadBlock, new RegExp(forbidden, "i"), `${forbidden} must not be submitted`);
  }
  assert.match(builderSource, /items\.some\(\(item\) => item\.book\.id === book\.id\)/);
});

test("customer details never expect administrator-private fields", () => {
  assert.doesNotMatch(detailSource, /adminInternal|contactHistory|statusHistory|reviewedBy/);
  assert.match(detailSource, /customerVisibleAdminNote/);
  assert.match(detailSource, /request\.quote &&/);
});

test("request copy and formatting are localized", () => {
  assert.equal(getBookRequestCopy("ar").requestBooks, "طلب الكتب");
  assert.equal(getRequestStatusLabel("under_review", "en"), "Under Review");
  assert.equal(getRequestStatusLabel("not_required_yet", "ar"), "الدفع غير مطلوب حاليًا");
  assert.match(formatRequestNumber(123, "ar"), /[١٢٣]/);
  assert.doesNotMatch(formatRequestDate("2026-08-14T10:00:00Z", "ar"), /Aug/);
});
