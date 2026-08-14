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
const sidebarSource = readSource(
  "src/components/Admin/Layout/AdminSidebar.jsx",
);
const serviceSource = readSource("src/Services/adminBookRequestService.js");
const listPageSource = readSource("src/Pages/Admin/AdminBookRequestsPage.jsx");
const quoteSource = readSource(
  "src/components/Admin/BookRequests/QuoteEditor.jsx",
);
const workflowSource = readSource(
  "src/components/Admin/BookRequests/WorkflowPanel.jsx",
);
const notesSource = readSource(
  "src/components/Admin/BookRequests/NotesPanel.jsx",
);

test("admin Book Request routes are lazy and discoverable", () => {
  assert.match(appSource, /const AdminBookRequestsPage = lazy/);
  assert.match(appSource, /const AdminBookRequestDetailPage = lazy/);
  assert.match(appSource, /path="requests"/);
  assert.match(appSource, /path="requests\/:id"/);
  assert.match(sidebarSource, /path: "\/admin\/requests"/);
});

test("one service owns all existing administrator request endpoints", () => {
  for (const endpoint of [
    'api.get("/admin/book-requests"',
    "api.get(`/admin/book-requests/${id}`",
    "api.patch(`/admin/book-requests/${id}/assignment`",
    "api.patch(`/admin/book-requests/${id}/status`",
    "api.put(`/admin/book-requests/${id}/quote`",
    "api.patch(`/admin/book-requests/${id}/notes`",
    "api.post(`/admin/book-requests/${id}/contact-history`",
  ]) {
    assert.ok(serviceSource.includes(endpoint), `${endpoint} is missing`);
  }
});

test("the request list sends URL filters to the backend", () => {
  assert.match(listPageSource, /getAdminBookRequests\(/);
  assert.match(listPageSource, /Object\.fromEntries\(new URLSearchParams\(queryString\)\)/);
  assert.doesNotMatch(listPageSource, /result\.requests\.filter\(/);
});

test("quote submission excludes authoritative calculated totals", () => {
  const submittedPayload = quoteSource.slice(
    quoteSource.indexOf("await onSave({"),
    quoteSource.indexOf("} catch (requestError)"),
  );
  assert.match(submittedPayload, /agreedQuantity/);
  assert.match(submittedPayload, /agreedUnitPrice/);
  assert.match(submittedPayload, /shippingCost/);
  assert.match(submittedPayload, /discountAmount/);
  assert.match(submittedPayload, /taxAmount/);
  assert.match(submittedPayload, /quoteValidUntil/);
  assert.doesNotMatch(submittedPayload, /finalTotal|agreedSubtotal/);
  assert.match(quoteSource, /backend response is authoritative/i);
});

test("payment status remains read-only and notes remain visibly separated", () => {
  assert.match(workflowSource, /Payment status.*read only/s);
  assert.doesNotMatch(workflowSource, /statusType="payment"|Next payment status/i);
  assert.match(notesSource, /Customer note.*read only/s);
  assert.match(notesSource, /Customer-visible admin note/);
  assert.match(notesSource, /ADMIN ONLY/);
});
