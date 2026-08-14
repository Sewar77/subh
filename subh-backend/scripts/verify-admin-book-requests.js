import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import adminRouter from "../src/routes/adminBookRequest.Routes.js";
import { adminOnly } from "../src/middleware/adminOnly.Middleware.js";
import { protect } from "../src/middleware/protect.Middleware.js";
import {
  adminAssignmentSchema,
  adminBookRequestListQuerySchema,
  adminContactHistorySchema,
  adminQuoteSchema,
  adminRequestNotesSchema,
  adminWorkflowStatusSchema,
} from "../src/validation/adminBookRequest.Validation.js";
import { listAdminBookRequests } from "../src/models/adminBookRequest.Model.js";
import {
  assignBookRequestAdmin,
  assertBookRequestTransition,
  changeBookRequestStatus,
  prepareBookRequestQuote,
  recordBookRequestContact,
} from "../src/services/bookRequests/adminBookRequestService.js";
import { serializeBookRequestDetail } from "../src/utils/bookRequestSerializer.js";
import { serializeAdminBookRequestDetail } from "../src/utils/adminBookRequestSerializer.js";

const responseRecorder = () => {
  const state = { statusCode: null, body: null };
  return {
    state,
    response: {
      status(code) {
        state.statusCode = code;
        return this;
      },
      json(body) {
        state.body = body;
        return this;
      },
    },
  };
};

const anonymous = responseRecorder();
await protect({ cookies: {} }, anonymous.response, () => {
  throw new Error("Anonymous request must not continue");
});
assert.equal(anonymous.state.statusCode, 401);

const normalUser = responseRecorder();
adminOnly(
  { user: { id: 2, role: "user" } },
  normalUser.response,
  () => {
    throw new Error("Normal user must not continue");
  },
);
assert.equal(normalUser.state.statusCode, 403);

let adminContinued = false;
adminOnly(
  { user: { id: 1, role: "admin" } },
  responseRecorder().response,
  () => {
    adminContinued = true;
  },
);
assert.equal(adminContinued, true);

for (const layer of adminRouter.stack) {
  if (!layer.route) continue;
  const handlers = layer.route.stack.map(({ handle }) => handle.name);
  assert.ok(handlers.includes("protect"), `${layer.route.path} lacks protect`);
  assert.ok(handlers.includes("adminOnly"), `${layer.route.path} lacks adminOnly`);
}

const listValidation = adminBookRequestListQuerySchema.validate({
  page: 2,
  limit: 50,
  requestStatus: "under_review",
  customerType: "company",
  followUpDue: true,
  search: "SUBH-2026",
});
assert.equal(listValidation.error, undefined);
assert.ok(
  adminBookRequestListQuerySchema.validate({ limit: 1000 }).error,
  "Admin pagination must retain a safe upper bound",
);
assert.ok(
  adminBookRequestListQuerySchema.validate({ unsafeSort: "DROP" }).error,
  "Unknown list fields must be rejected",
);

const validQuote = {
  items: [
    { itemId: 10, agreedQuantity: 300, agreedUnitPrice: "0.05" },
    { itemId: 11, agreedQuantity: 200, agreedUnitPrice: "0.05" },
  ],
  shippingCost: "5.00",
  discountAmount: "3.00",
  taxAmount: "2.00",
  quoteValidUntil: "2026-09-30",
  customerVisibleNote: "Quote prepared for review.",
};
assert.equal(adminQuoteSchema.validate(validQuote).error, undefined);
for (const calculatedField of [
  "agreedSubtotal",
  "agreedLineSubtotal",
  "finalTotal",
]) {
  assert.ok(
    adminQuoteSchema.validate({ ...validQuote, [calculatedField]: "0.01" }).error,
    `${calculatedField} must be server-calculated`,
  );
}
assert.ok(
  adminWorkflowStatusSchema.validate({
    statusType: "payment",
    status: "paid",
  }).error,
  "Payment status management is outside this phase",
);
assert.equal(
  adminWorkflowStatusSchema.validate({
    statusType: "request",
    status: "under_review",
    note: "Review started",
  }).error,
  undefined,
);
assert.throws(
  () => assertBookRequestTransition("fulfillment", "not_started", "delivered"),
  (error) => error.code === "INVALID_STATUS_TRANSITION",
);
assert.doesNotThrow(() =>
  assertBookRequestTransition("quote", "draft", "sent"),
);
assert.doesNotThrow(() =>
  assertBookRequestTransition("quote", "sent", "accepted"),
);
assert.doesNotThrow(() =>
  assertBookRequestTransition("quote", "sent", "declined"),
);
assert.equal(
  adminAssignmentSchema.validate({ assignedAdminId: null }).error,
  undefined,
);
assert.equal(
  adminRequestNotesSchema.validate({ adminInternalNote: "Internal only" }).error,
  undefined,
);
assert.equal(
  adminContactHistorySchema.validate({
    contactMethod: "phone",
    outcome: "no_answer",
    nextFollowUpAt: "2026-09-01T10:00:00.000Z",
  }).error,
  undefined,
);

const filterCalls = [];
await listAdminBookRequests(
  {
    ...listValidation.value,
    assignedAdminId: 7,
    contactStatus: "follow_up_required",
  },
  {
    async query(sql, values) {
      filterCalls.push({ sql, values });
      return filterCalls.length === 1
        ? { rows: [{ total: 0 }] }
        : { rows: [] };
    },
  },
);
assert.equal(filterCalls.length, 2);
assert.equal(filterCalls[0].sql.includes("SUBH-2026"), false);
assert.ok(filterCalls[0].values.includes("%SUBH-2026%"));
assert.match(filterCalls[1].sql, /ORDER BY r\.created_at DESC, r\.id DESC/);

const requestRow = {
  id: 90,
  reference_number: "SUBH-2026-000090",
  user_id: 2,
  customer_full_name: "Example Customer",
  customer_email: "customer@example.test",
  customer_phone: "+20 100 000 0000",
  customer_user_type: "company",
  customer_company_name: "Example Company",
  request_status: "pending",
  contact_status: "not_contacted",
  payment_status: "not_required_yet",
  fulfillment_status: "not_started",
  quote_status: "not_prepared",
  estimated_subtotal: "25.00",
  estimated_shipping_cost: "5.00",
  estimated_total: "30.00",
  agreed_subtotal: null,
  shipping_cost: null,
  discount_amount: "0.00",
  tax_amount: "0.00",
  final_total: null,
  currency_code: "USD",
  shipping_recipient: "Recipient",
  shipping_phone: "+20 100 000 0000",
  shipping_address_line1: "Address",
  shipping_city: "Cairo",
  shipping_state: "Cairo",
  shipping_postal_code: "11511",
  shipping_country: "EG",
  customer_note: "Customer note",
  customer_visible_note: "Visible note",
  admin_internal_note: "Internal note",
  last_contacted_at: null,
  next_follow_up_at: null,
  created_at: "2026-08-14T00:00:00.000Z",
  updated_at: "2026-08-14T00:00:00.000Z",
};
const itemRows = [
  {
    id: 10,
    book_id: 101,
    book_name_en_snapshot: "English One",
    book_name_ar_snapshot: "عربي واحد",
    requested_quantity: 300,
    unit_price_snapshot: "0.05",
    unit_shipping_cost_snapshot: "0.01",
    estimated_line_subtotal: "15.00",
    estimated_line_shipping: "3.00",
  },
  {
    id: 11,
    book_id: 102,
    book_name_en_snapshot: "English Two",
    book_name_ar_snapshot: "عربي اثنان",
    requested_quantity: 200,
    unit_price_snapshot: "0.05",
    unit_shipping_cost_snapshot: "0.01",
    estimated_line_subtotal: "10.00",
    estimated_line_shipping: "2.00",
  },
];
const customerDetail = serializeBookRequestDetail(
  requestRow,
  itemRows,
  "en",
);
assert.equal(Object.hasOwn(customerDetail, "adminInternalNote"), false);
assert.equal(Object.hasOwn(customerDetail, "contactHistory"), false);
assert.equal(JSON.stringify(customerDetail).includes("Internal note"), false);

const draftCustomerDetail = serializeBookRequestDetail(
  {
    ...requestRow,
    quote_status: "draft",
    agreed_subtotal: "25.00",
    shipping_cost: "5.00",
    final_total: "29.00",
  },
  itemRows.map((item) => ({
    ...item,
    agreed_quantity: item.requested_quantity,
    agreed_unit_price: "0.05",
    agreed_line_subtotal: item.estimated_line_subtotal,
  })),
  "en",
);
assert.equal(Object.hasOwn(draftCustomerDetail, "quote"), false);
assert.equal(
  Object.hasOwn(draftCustomerDetail.items[0], "agreedUnitPrice"),
  false,
);

const sentCustomerDetail = serializeBookRequestDetail(
  { ...requestRow, quote_status: "sent", agreed_subtotal: "25.00" },
  [{ ...itemRows[0], agreed_quantity: 300, agreed_unit_price: "0.05", agreed_line_subtotal: "15.00" }],
  "en",
);
assert.equal(sentCustomerDetail.quote.agreedSubtotal, "25.00");
assert.equal(sentCustomerDetail.items[0].agreedUnitPrice, "0.05");

const adminDetail = serializeAdminBookRequestDetail({
  request: requestRow,
  items: itemRows,
  contactHistory: [
    {
      id: 1,
      admin_id: 1,
      admin_name: "Administrator",
      admin_email: "admin@example.test",
      contact_method: "phone",
      outcome: "no_answer",
      note: "Called",
      contacted_at: "2026-08-15T00:00:00.000Z",
      next_follow_up_at: null,
      created_at: "2026-08-15T00:00:00.000Z",
    },
  ],
  statusHistory: [],
});
assert.equal(adminDetail.notes.adminInternal, "Internal note");
assert.equal(adminDetail.items[0].nameEn, "English One");
assert.equal(adminDetail.items[0].nameAr, "عربي واحد");
assert.equal(adminDetail.contactHistory.length, 1);

const transactionClient = (handler) => {
  const queries = [];
  let released = false;
  return {
    queries,
    get released() {
      return released;
    },
    client: {
      async query(sql, values = []) {
        const statement = sql.trim();
        queries.push({ statement, values });
        if (statement === "BEGIN" || statement === "COMMIT" || statement === "ROLLBACK") {
          return { rows: [] };
        }
        return handler(statement, values);
      },
      release() {
        released = true;
      },
    },
  };
};

let quoteUpdateValues;
let quoteHistoryValues;
const quoteTx = transactionClient((statement, values) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [{ ...requestRow, id: 90 }] };
  }
  if (statement.includes("FROM book_request_items") && statement.includes("FOR UPDATE")) {
    return { rows: itemRows.map(({ id }) => ({ id })) };
  }
  if (statement.includes("UPDATE book_request_items")) {
    return {
      rows: [
        { id: 10, agreed_line_subtotal: "15.00" },
        { id: 11, agreed_line_subtotal: "10.00" },
      ],
    };
  }
  if (statement.includes("UPDATE book_requests") && statement.includes("agreed_subtotal")) {
    quoteUpdateValues = values;
    return { rows: [{ id: 90, quote_status: "draft", final_total: "29.00" }] };
  }
  if (statement.includes("FROM book_request_payment_summary summary")) {
    return { rows: [{ request_id: 90, final_total: "29.00", currency_code: "USD", total_payments: "0.00", total_refunds: "0.00", net_paid: "0.00", remaining_balance: "29.00", payment_status: "not_required_yet" }] };
  }
  if (statement.includes("INSERT INTO request_status_history")) {
    quoteHistoryValues = values;
    return { rows: [{ id: 1 }] };
  }
  throw new Error(`Unexpected quote query: ${statement.slice(0, 60)}`);
});
await prepareBookRequestQuote(
  {
    requestId: 90,
    adminId: 1,
    quote: adminQuoteSchema.validate(validQuote).value,
  },
  { dbPool: { connect: async () => quoteTx.client } },
);
assert.equal(quoteUpdateValues[1], "25.00");
assert.equal(quoteUpdateValues[2], "5.00");
assert.equal(quoteUpdateValues[3], "3.00");
assert.equal(quoteUpdateValues[4], "2.00");
assert.deepEqual(quoteHistoryValues.slice(1, 5), [
  "quote",
  "not_prepared",
  "draft",
  1,
]);
assert.ok(quoteTx.queries.some(({ statement }) => statement === "COMMIT"));

const negativeQuoteTx = transactionClient((statement) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [requestRow] };
  }
  if (statement.includes("FROM book_request_items") && statement.includes("FOR UPDATE")) {
    return { rows: itemRows.map(({ id }) => ({ id })) };
  }
  if (statement.includes("UPDATE book_request_items")) {
    return {
      rows: [
        { id: 10, agreed_line_subtotal: "15.00" },
        { id: 11, agreed_line_subtotal: "10.00" },
      ],
    };
  }
  throw new Error("Negative total must fail before request quote update");
});
await assert.rejects(
  prepareBookRequestQuote(
    {
      requestId: 90,
      adminId: 1,
      quote: adminQuoteSchema.validate({
        ...validQuote,
        discountAmount: "100.00",
      }).value,
    },
    { dbPool: { connect: async () => negativeQuoteTx.client } },
  ),
  (error) => error.code === "NEGATIVE_FINAL_TOTAL",
);
assert.ok(
  negativeQuoteTx.queries.some(({ statement }) => statement === "ROLLBACK"),
);

let statusHistoryValues;
const statusTx = transactionClient((statement, values) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [requestRow] };
  }
  if (statement.includes("UPDATE book_requests")) {
    return { rows: [{ id: 90, request_status: "under_review" }] };
  }
  if (statement.includes("FROM book_request_payment_summary summary")) {
    return { rows: [{ request_id: 90, final_total: null, currency_code: "USD", total_payments: "0.00", total_refunds: "0.00", net_paid: "0.00", remaining_balance: null, payment_status: "not_required_yet" }] };
  }
  if (statement.includes("INSERT INTO request_status_history")) {
    statusHistoryValues = values;
    return { rows: [{ id: 2 }] };
  }
  throw new Error("Unexpected status query");
});
await changeBookRequestStatus(
  {
    requestId: 90,
    adminId: 1,
    statusType: "request",
    status: "under_review",
    note: "Review started",
  },
  { dbPool: { connect: async () => statusTx.client } },
);
assert.deepEqual(statusHistoryValues, [
  90,
  "request",
  "pending",
  "under_review",
  1,
  "Review started",
]);

const acceptedQuoteHistories = [];
const acceptedQuoteTx = transactionClient((statement, values) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [{ ...requestRow, quote_status: "sent", final_total: "29.00" }] };
  }
  if (statement.includes("UPDATE book_requests") && statement.includes("quoted_at = CASE")) {
    return { rows: [{ id: 90, quote_status: "accepted" }] };
  }
  if (statement.includes("FROM book_request_payment_summary summary")) {
    return { rows: [{ request_id: 90, final_total: "29.00", currency_code: "USD", total_payments: "0.00", total_refunds: "0.00", net_paid: "0.00", remaining_balance: "29.00", payment_status: "not_required_yet" }] };
  }
  if (statement.includes("UPDATE book_requests") && statement.includes("payment_status = $2")) {
    return { rows: [{ id: 90, payment_status: values[1] }] };
  }
  if (statement.includes("INSERT INTO request_status_history")) {
    acceptedQuoteHistories.push(values);
    return { rows: [{ id: acceptedQuoteHistories.length }] };
  }
  throw new Error(`Unexpected accepted quote query: ${statement.slice(0, 60)}`);
});
await changeBookRequestStatus(
  {
    requestId: 90,
    adminId: 1,
    statusType: "quote",
    status: "accepted",
  },
  { dbPool: { connect: async () => acceptedQuoteTx.client } },
);
assert.equal(acceptedQuoteHistories.length, 2);
assert.deepEqual(acceptedQuoteHistories[1].slice(1, 5), [
  "payment",
  "not_required_yet",
  "awaiting_payment",
  1,
]);

const statusRollbackTx = transactionClient((statement) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [requestRow] };
  }
  if (statement.includes("UPDATE book_requests")) {
    return { rows: [{ id: 90, request_status: "under_review" }] };
  }
  if (statement.includes("INSERT INTO request_status_history")) {
    throw new Error("Simulated status history failure");
  }
  throw new Error("Unexpected status rollback query");
});
await assert.rejects(
  changeBookRequestStatus(
    {
      requestId: 90,
      adminId: 1,
      statusType: "request",
      status: "under_review",
    },
    { dbPool: { connect: async () => statusRollbackTx.client } },
  ),
  /Simulated status history failure/,
);
assert.ok(
  statusRollbackTx.queries.some(({ statement }) => statement === "ROLLBACK"),
);
assert.equal(
  statusRollbackTx.queries.some(({ statement }) => statement === "COMMIT"),
  false,
);

let contactUpdateValues;
let contactStatusHistoryValues;
const contactTx = transactionClient((statement, values) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [requestRow] };
  }
  if (statement.includes("INSERT INTO request_contact_history")) {
    return {
      rows: [
        {
          id: 3,
          contacted_at: "2026-08-15T10:00:00.000Z",
          next_follow_up_at: "2026-08-16T10:00:00.000Z",
        },
      ],
    };
  }
  if (statement.includes("last_contacted_at")) {
    contactUpdateValues = values;
    return { rows: [{ id: 90, contact_status: "attempted" }] };
  }
  if (statement.includes("INSERT INTO request_status_history")) {
    contactStatusHistoryValues = values;
    return { rows: [{ id: 4 }] };
  }
  throw new Error("Unexpected contact query");
});
await recordBookRequestContact(
  {
    requestId: 90,
    adminId: 1,
    contact: {
      contactMethod: "phone",
      outcome: "no_answer",
      note: "No answer",
      nextFollowUpAt: "2026-08-16T10:00:00.000Z",
    },
  },
  { dbPool: { connect: async () => contactTx.client } },
);
assert.equal(contactUpdateValues[3], "attempted");
assert.deepEqual(contactStatusHistoryValues.slice(1, 5), [
  "contact",
  "not_contacted",
  "attempted",
  1,
]);

const invalidAssignmentTx = transactionClient((statement) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [requestRow] };
  }
  if (statement.includes("FROM users")) return { rows: [] };
  throw new Error("Assignment must fail before update");
});
await assert.rejects(
  assignBookRequestAdmin(
    { requestId: 90, assignedAdminId: 2 },
    { dbPool: { connect: async () => invalidAssignmentTx.client } },
  ),
  (error) => error.code === "INVALID_ASSIGNED_ADMIN",
);
assert.ok(
  invalidAssignmentTx.queries.some(({ statement }) => statement === "ROLLBACK"),
);

const rollbackTx = transactionClient((statement) => {
  if (statement.includes("FROM book_requests") && statement.includes("FOR UPDATE")) {
    return { rows: [requestRow] };
  }
  if (statement.includes("FROM book_request_items") && statement.includes("FOR UPDATE")) {
    return { rows: itemRows.map(({ id }) => ({ id })) };
  }
  if (statement.includes("UPDATE book_request_items")) {
    throw new Error("Simulated quote item failure");
  }
  throw new Error("Unexpected rollback query");
});
await assert.rejects(
  prepareBookRequestQuote(
    {
      requestId: 90,
      adminId: 1,
      quote: adminQuoteSchema.validate(validQuote).value,
    },
    { dbPool: { connect: async () => rollbackTx.client } },
  ),
  /Simulated quote item failure/,
);
assert.ok(rollbackTx.queries.some(({ statement }) => statement === "ROLLBACK"));
assert.equal(
  rollbackTx.queries.some(({ statement }) => statement === "COMMIT"),
  false,
);

const modelSource = await readFile(
  new URL("../src/models/adminBookRequest.Model.js", import.meta.url),
  "utf8",
);
assert.equal(modelSource.includes("SELECT *"), false);
assert.equal(modelSource.includes("RETURNING *"), false);
assert.match(modelSource, /role = 'admin' AND is_active = TRUE/);
assert.match(
  modelSource,
  /final_total = \(\$2::numeric \+ \$3::numeric \+ \$5::numeric - \$4::numeric\)/,
);

console.log("Admin Book Request verification passed");
