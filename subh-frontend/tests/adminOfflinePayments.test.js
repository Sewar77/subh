import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDirectory, "..");
const readSource = (relativePath) =>
  fs.readFileSync(path.join(frontendRoot, relativePath), "utf8");

const detailSource = readSource("src/Pages/Admin/AdminBookRequestDetailPage.jsx");
const serviceSource = readSource("src/Services/adminBookRequestService.js");
const panelSource = readSource("src/components/Admin/BookRequests/PaymentPanel.jsx");
const formSource = readSource("src/components/Admin/BookRequests/PaymentEntryForm.jsx");
const ledgerSource = readSource("src/components/Admin/BookRequests/PaymentLedger.jsx");
const modalSource = readSource("src/components/Admin/Modal/ConfirmDeleteModal.jsx");

test("canonical admin service owns the offline payment endpoints", () => {
  for (const endpoint of [
    "api.get(`/admin/book-requests/${id}/payments`",
    "api.post(`/admin/book-requests/${id}/payments`, payload)",
    "api.post(`/admin/book-requests/${id}/refunds`, payload)",
    "`/admin/book-requests/${id}/payments/${paymentId}/void`",
  ]) {
    assert.ok(serviceSource.includes(endpoint), `${endpoint} is missing`);
  }
});

test("payment and refund forms send only backend-supported ledger fields", () => {
  const payloadSource = formSource.slice(
    formSource.indexOf("const payload ="),
    formSource.indexOf("await onSubmit(payload)"),
  );
  for (const field of [
    "amount",
    "method",
    "paidAt",
    "externalReference",
    "purchaseOrderNumber",
    "note",
  ]) {
    assert.match(payloadSource, new RegExp(field));
  }
  assert.doesNotMatch(
    payloadSource,
    /requestId|currency|kind|status|balance|adminId|paymentStatus|finalTotal/,
  );
  assert.match(formSource, /kind="refund"|kind === "refund"/);
});

test("backend summary remains authoritative and payment status is not editable", () => {
  for (const field of [
    "finalTotal",
    "totalPayments",
    "totalRefunds",
    "netPaid",
    "remainingBalance",
    "paymentStatus",
    "currency",
  ]) {
    assert.match(panelSource, new RegExp(`summary\\.${field}`));
  }
  assert.match(panelSource, /accepted.*confirmed.*completed/s);
  assert.doesNotMatch(panelSource, /statusType=["']payment["']|payment status.*select/is);
  assert.match(detailSource, /await getAdminBookRequest\(id\)/);
});

test("ledger preserves voided entries and is responsive", () => {
  assert.match(ledgerSource, /recordStatus === "voided"/);
  assert.match(ledgerSource, /voidAudit\.reason/);
  assert.match(ledgerSource, /display: \{ xs: "none", md: "block" \}/);
  assert.match(ledgerSource, /display: \{ xs: "flex", md: "none" \}/);
  for (const field of [
    "kind",
    "amount",
    "method",
    "paidAt",
    "externalReference",
    "purchaseOrderNumber",
    "note",
    "recordedBy",
    "createdAt",
  ]) {
    assert.match(ledgerSource, new RegExp(`entry\\.${field}`));
  }
});

test("void uses the reusable confirmation modal with a required audit reason", () => {
  assert.match(panelSource, /<ConfirmDeleteModal/);
  assert.match(panelSource, /label="Void reason"/);
  assert.match(panelSource, /confirmDisabled=\{voidReason\.trim\(\)\.length < 3\}/);
  assert.match(panelSource, /audited correction, not a deletion.*remain visible.*recalculate balances and payment status/s);
  assert.match(modalSource, /confirmDisabled/);
  assert.doesNotMatch(`${panelSource}\n${ledgerSource}`, /window\.(alert|confirm)|\balert\(|\bconfirm\(/i);
});
