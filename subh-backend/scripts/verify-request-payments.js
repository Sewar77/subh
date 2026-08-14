import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import adminRouter from "../src/routes/adminBookRequest.Routes.js";
import { adminOnly } from "../src/middleware/adminOnly.Middleware.js";
import { protect } from "../src/middleware/protect.Middleware.js";
import {
  deriveBookRequestPaymentStatus,
  recordOfflineBookRequestPayment,
  recordOfflineBookRequestRefund,
  voidOfflineBookRequestPayment,
} from "../src/services/bookRequests/requestPaymentService.js";
import {
  paymentRecordParamSchema,
  recordPaymentSchema,
  recordRefundSchema,
  voidPaymentSchema,
} from "../src/validation/requestPayment.Validation.js";
import { serializeBookRequestDetail } from "../src/utils/bookRequestSerializer.js";
import {
  serializeAdminPaymentRecord,
  serializePaymentSummary,
} from "../src/utils/requestPaymentSerializer.js";

const responseRecorder = () => {
  const state = { statusCode: null };
  return {
    state,
    response: {
      status(code) {
        state.statusCode = code;
        return this;
      },
      json() {
        return this;
      },
    },
  };
};

const anonymous = responseRecorder();
await protect({ cookies: {} }, anonymous.response, () => {
  throw new Error("Anonymous payment request must not continue");
});
assert.equal(anonymous.state.statusCode, 401);

const user = responseRecorder();
adminOnly({ user: { role: "user" } }, user.response, () => {
  throw new Error("Normal user must not reach admin payment endpoints");
});
assert.equal(user.state.statusCode, 403);

for (const layer of adminRouter.stack) {
  if (!layer.route || !layer.route.path.includes("payment") && !layer.route.path.includes("refund")) continue;
  const handlers = layer.route.stack.map(({ handle }) => handle.name);
  assert.ok(handlers.includes("protect"), `${layer.route.path} lacks protect`);
  assert.ok(handlers.includes("adminOnly"), `${layer.route.path} lacks adminOnly`);
}

const validPayment = {
  amount: "25.50",
  method: "bank_transfer",
  paidAt: "2026-08-01T10:00:00.000Z",
  externalReference: "OFFLINE-REF-1",
  purchaseOrderNumber: "PO-1",
  note: "Received offline.",
};
assert.equal(recordPaymentSchema.validate(validPayment).error, undefined);
assert.equal(
  recordRefundSchema.validate({
    amount: "5.00",
    method: "wire_transfer",
    paidAt: "2026-08-01T10:00:00.000Z",
  }).error,
  undefined,
);
for (const invalid of ["0", "0.00", "-1.00", "1.001", "NaN"]) {
  assert.ok(recordPaymentSchema.validate({ ...validPayment, amount: invalid }).error);
}
assert.ok(recordPaymentSchema.validate({ ...validPayment, method: "card" }).error);
assert.ok(recordPaymentSchema.validate({ ...validPayment, currency: "EUR" }).error);
assert.ok(recordPaymentSchema.validate({ ...validPayment, paymentStatus: "paid" }).error);
assert.ok(recordPaymentSchema.validate({ ...validPayment, cardNumber: "4111" }).error);
assert.ok(recordRefundSchema.validate({ ...validPayment, purchaseOrderNumber: "PO" }).error);
assert.equal(voidPaymentSchema.validate({ reason: "Incorrect duplicate" }).error, undefined);
assert.ok(voidPaymentSchema.validate({ reason: "x" }).error);
assert.equal(paymentRecordParamSchema.validate({ id: 1, paymentId: 2 }).error, undefined);

const summary = (overrides = {}) => ({
  final_total: "100.00",
  total_payments: "0.00",
  total_refunds: "0.00",
  net_paid: "0.00",
  remaining_balance: "100.00",
  ...overrides,
});
const request = (overrides = {}) => ({
  id: 1,
  request_status: "confirmed",
  quote_status: "accepted",
  payment_status: "awaiting_payment",
  final_total: "100.00",
  ...overrides,
});
assert.equal(deriveBookRequestPaymentStatus(request(), summary()), "awaiting_payment");
assert.equal(deriveBookRequestPaymentStatus(request(), summary({ total_payments: "25.00", net_paid: "25.00" })), "partially_paid");
assert.equal(deriveBookRequestPaymentStatus(request(), summary({ total_payments: "100.00", net_paid: "100.00", remaining_balance: "0.00" })), "paid");
assert.equal(deriveBookRequestPaymentStatus(request(), summary({ total_payments: "100.00", total_refunds: "100.00", net_paid: "0.00" })), "refunded");
assert.equal(deriveBookRequestPaymentStatus(request({ request_status: "cancelled", quote_status: "declined", payment_status: "not_required_yet" }), summary()), "cancelled");

const createLedgerPool = ({ failHistory = false } = {}) => {
  const state = {
    request: request(),
    payments: [],
    history: [],
    nextId: 1,
    snapshot: null,
  };
  const restore = (snapshot) => {
    state.request = snapshot.request;
    state.payments = snapshot.payments;
    state.history = snapshot.history;
    state.nextId = snapshot.nextId;
  };
  const activeTotals = () => {
    const active = state.payments.filter(({ record_status: status }) => status === "recorded");
    const cents = (kind) => active.filter((entry) => entry.payment_kind === kind).reduce((sum, entry) => sum + Math.round(Number(entry.amount) * 100), 0);
    const paymentCents = cents("payment");
    const refundCents = cents("refund");
    const netCents = paymentCents - refundCents;
    const finalCents = Math.round(Number(state.request.final_total) * 100);
    const money = (value) => (value / 100).toFixed(2);
    return {
      request_id: state.request.id,
      final_total: state.request.final_total,
      currency_code: state.request.currency_code,
      total_payments: money(paymentCents),
      total_refunds: money(refundCents),
      net_paid: money(netCents),
      remaining_balance: money(finalCents - netCents),
      payment_status: state.request.payment_status,
    };
  };
  const client = {
    async query(sql, values = []) {
      const compact = sql.replace(/\s+/g, " ").trim();
      if (compact === "BEGIN") {
        state.snapshot = structuredClone({ request: state.request, payments: state.payments, history: state.history, nextId: state.nextId });
        return { rows: [] };
      }
      if (compact === "COMMIT") {
        state.snapshot = null;
        return { rows: [] };
      }
      if (compact === "ROLLBACK") {
        if (state.snapshot) restore(state.snapshot);
        state.snapshot = null;
        return { rows: [] };
      }
      if (compact.includes("FROM book_requests") && compact.includes("FOR UPDATE")) return { rows: [{ ...state.request }] };
      if (compact.includes("FROM book_request_payment_summary summary")) return { rows: [activeTotals()] };
      if (compact.startsWith("INSERT INTO request_payments")) {
        const entry = {
          id: state.nextId++, request_id: values[0], payment_kind: values[1], amount: values[2],
          currency_code: values[3], payment_method: values[4], paid_at: values[5],
          external_reference: values[6], purchase_order_number: values[7], note: values[8],
          recorded_by_admin_id: values[9], record_status: "recorded", created_at: "2026-08-14T00:00:00.000Z",
        };
        state.payments.push(entry);
        return { rows: [{ ...entry }] };
      }
      if (compact.startsWith("UPDATE book_requests") && compact.includes("payment_status = $2")) {
        state.request.payment_status = values[1];
        return { rows: [{ id: state.request.id, payment_status: values[1] }] };
      }
      if (compact.startsWith("INSERT INTO request_status_history")) {
        if (failHistory) throw new Error("simulated history failure");
        state.history.push({ status_type: values[1], old_status: values[2], new_status: values[3], admin_id: values[4], note: values[5] });
        return { rows: [{ id: state.history.length }] };
      }
      if (compact.includes("FROM request_payments") && compact.includes("FOR UPDATE")) {
        const entry = state.payments.find((candidate) => candidate.id === values[0] && candidate.request_id === values[1]);
        return { rows: entry ? [{ ...entry }] : [] };
      }
      if (compact.startsWith("UPDATE request_payments")) {
        const entry = state.payments.find((candidate) => candidate.id === values[0] && candidate.request_id === values[1] && candidate.record_status === "recorded");
        if (!entry) return { rows: [] };
        Object.assign(entry, { record_status: "voided", voided_at: "2026-08-14T12:00:00.000Z", voided_by_admin_id: values[2], void_reason: values[3] });
        return { rows: [{ ...entry }] };
      }
      throw new Error(`Unexpected payment verification query: ${compact}`);
    },
    release() {},
  };
  return { state, dbPool: { async connect() { return client; } } };
};

const paymentInput = (amount) => ({
  requestId: 1,
  adminId: 9,
  payment: { amount, method: "bank_transfer", paidAt: "2026-08-01T10:00:00.000Z" },
});
const ledger = createLedgerPool();
await recordOfflineBookRequestPayment(paymentInput("25.00"), { dbPool: ledger.dbPool });
assert.equal(ledger.state.request.payment_status, "partially_paid");
assert.equal(ledger.state.history.length, 1);
await recordOfflineBookRequestPayment(paymentInput("25.00"), { dbPool: ledger.dbPool });
assert.equal(ledger.state.request.payment_status, "partially_paid");
assert.equal(ledger.state.history.length, 1, "No history is written when status is unchanged");
await recordOfflineBookRequestPayment(paymentInput("50.00"), { dbPool: ledger.dbPool });
assert.equal(ledger.state.request.payment_status, "paid");
await recordOfflineBookRequestRefund(paymentInput("20.00"), { dbPool: ledger.dbPool });
assert.equal(ledger.state.request.payment_status, "partially_paid");
await recordOfflineBookRequestRefund(paymentInput("80.00"), { dbPool: ledger.dbPool });
assert.equal(ledger.state.request.payment_status, "refunded");
const beforeOverRefund = ledger.state.payments.length;
await assert.rejects(
  recordOfflineBookRequestRefund(paymentInput("0.01"), { dbPool: ledger.dbPool }),
  (error) => error.code === "OVER_REFUND_NOT_ALLOWED",
);
assert.equal(ledger.state.payments.length, beforeOverRefund);

const overpayment = createLedgerPool();
await assert.rejects(
  recordOfflineBookRequestPayment(paymentInput("100.01"), { dbPool: overpayment.dbPool }),
  (error) => error.code === "OVERPAYMENT_NOT_ALLOWED",
);
assert.equal(overpayment.state.payments.length, 0);

const missingFinal = createLedgerPool();
missingFinal.state.request.final_total = null;
await assert.rejects(
  recordOfflineBookRequestPayment(paymentInput("1.00"), { dbPool: missingFinal.dbPool }),
  (error) => error.code === "FINAL_TOTAL_REQUIRED",
);

const blocked = createLedgerPool();
blocked.state.request.request_status = "cancelled";
await assert.rejects(
  recordOfflineBookRequestPayment(paymentInput("1.00"), { dbPool: blocked.dbPool }),
  (error) => error.code === "PAYMENT_NOT_ALLOWED",
);

const voidLedger = createLedgerPool();
await recordOfflineBookRequestPayment(paymentInput("40.00"), { dbPool: voidLedger.dbPool });
await voidOfflineBookRequestPayment({ requestId: 1, paymentId: 1, adminId: 9, reason: "Duplicate record" }, { dbPool: voidLedger.dbPool });
assert.equal(voidLedger.state.payments[0].record_status, "voided");
assert.equal(voidLedger.state.payments[0].void_reason, "Duplicate record");
assert.equal(voidLedger.state.request.payment_status, "awaiting_payment");
await assert.rejects(
  voidOfflineBookRequestPayment({ requestId: 1, paymentId: 1, adminId: 9, reason: "Again" }, { dbPool: voidLedger.dbPool }),
  (error) => error.code === "PAYMENT_ALREADY_VOIDED",
);

const voidRefundLedger = createLedgerPool();
await recordOfflineBookRequestPayment(paymentInput("100.00"), { dbPool: voidRefundLedger.dbPool });
await recordOfflineBookRequestRefund(paymentInput("20.00"), { dbPool: voidRefundLedger.dbPool });
await voidOfflineBookRequestPayment({ requestId: 1, paymentId: 2, adminId: 9, reason: "Refund entered incorrectly" }, { dbPool: voidRefundLedger.dbPool });
assert.equal(voidRefundLedger.state.payments[1].record_status, "voided");
assert.equal(voidRefundLedger.state.request.payment_status, "paid");

const invalidVoidLedger = createLedgerPool();
await recordOfflineBookRequestPayment(paymentInput("100.00"), { dbPool: invalidVoidLedger.dbPool });
await recordOfflineBookRequestRefund(paymentInput("50.00"), { dbPool: invalidVoidLedger.dbPool });
await assert.rejects(
  voidOfflineBookRequestPayment({ requestId: 1, paymentId: 1, adminId: 9, reason: "Would invalidate refund balance" }, { dbPool: invalidVoidLedger.dbPool }),
  (error) => error.code === "INVALID_PAYMENT_BALANCE",
);
assert.equal(invalidVoidLedger.state.payments[0].record_status, "recorded");

const rollback = createLedgerPool({ failHistory: true });
await assert.rejects(
  recordOfflineBookRequestPayment(paymentInput("10.00"), { dbPool: rollback.dbPool }),
  /simulated history failure/,
);
assert.equal(rollback.state.payments.length, 0);
assert.equal(rollback.state.request.payment_status, "awaiting_payment");

const paymentSummary = summary({ total_payments: "100.00", total_refunds: "25.00", net_paid: "75.00", remaining_balance: "25.00", currency_code: "USD" });
const customer = serializeBookRequestDetail(
  {
    id: 1, reference_number: "SUBH-1", request_status: "confirmed", contact_status: "contacted",
    payment_status: "partially_paid", fulfillment_status: "not_started", quote_status: "accepted",
    currency_code: "USD", estimated_subtotal: "90.00", estimated_shipping_cost: "10.00", estimated_total: "100.00",
    customer_full_name: "Customer", customer_email: "customer@example.test", customer_phone: "+200000",
    customer_user_type: "individual", customer_company_name: null, shipping_recipient: "Customer",
    shipping_phone: "+200000", shipping_address_line1: "Address", shipping_city: "Cairo", shipping_state: "Cairo",
    shipping_postal_code: "11511", shipping_country: "EG", agreed_subtotal: "90.00", shipping_cost: "10.00",
    discount_amount: "0.00", tax_amount: "0.00", final_total: "100.00",
  },
  [],
  "en",
  paymentSummary,
);
assert.deepEqual(customer.paymentSummary, {
  totalPayments: "100.00", totalRefunds: "25.00", netPaid: "75.00", remainingBalance: "25.00",
  finalTotal: "100.00", currency: "USD", paymentStatus: "partially_paid",
});
const customerJson = JSON.stringify(customer);
for (const secret of ["recordedBy", "voidAudit", "voidReason", "adminInternal", "routing", "cardNumber"]) assert.equal(customerJson.includes(secret), false);
const draftCustomer = serializeBookRequestDetail(
  { ...request(), quote_status: "draft", currency_code: "USD" },
  [],
  "en",
  paymentSummary,
);
assert.equal(Object.hasOwn(draftCustomer, "paymentSummary"), false);

const adminRecord = serializeAdminPaymentRecord({
  id: 1, payment_kind: "payment", amount: "25.00", currency_code: "USD", payment_method: "cash",
  paid_at: "2026-08-01T10:00:00.000Z", record_status: "voided", recorded_by_id: 9,
  recorded_by_name: "Admin", recorded_by_email: "admin@example.test", created_at: "2026-08-01T10:00:00.000Z",
  voided_at: "2026-08-02T10:00:00.000Z", voided_by_id: 10, voided_by_name: "Reviewer",
  voided_by_email: "reviewer@example.test", void_reason: "Duplicate",
});
assert.equal(adminRecord.recordStatus, "voided");
assert.equal(adminRecord.voidAudit.reason, "Duplicate");
assert.equal(serializePaymentSummary(paymentSummary, "partially_paid").netPaid, "75.00");

const paymentModelSource = await readFile(new URL("../src/models/requestPayment.Model.js", import.meta.url), "utf8");
assert.doesNotMatch(paymentModelSource, /SELECT\s+\*/i);
assert.match(paymentModelSource, /WHERE id = \$1 AND request_id = \$2/);
const customerModelSource = await readFile(new URL("../src/models/bookRequest.Model.js", import.meta.url), "utf8");
assert.match(customerModelSource, /r\.id = \$1 AND r\.user_id = \$2/);

console.log("Offline Book Request payment verification passed.");
