import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import bookRequestRouter from "../src/routes/bookRequest.Routes.js";
import {
  createBookRequestSchema,
  bookRequestDetailQuerySchema,
  bookRequestIdParamSchema,
  bookRequestListQuerySchema,
} from "../src/validation/bookRequest.Validation.js";
import { createCustomerBookRequest } from "../src/services/bookRequests/bookRequestService.js";
import { getOwnBookRequestById } from "../src/models/bookRequest.Model.js";
import { serializeBookRequestDetail } from "../src/utils/bookRequestSerializer.js";

const validPayload = {
  items: [
    { bookId: 11, quantity: 300 },
    { bookId: 12, quantity: 450 },
  ],
  shipping: {
    recipient: "Example Recipient",
    company: "Example Institution",
    phone: "+20 100 000 0000",
    addressLine1: "10 Example Street",
    city: "Cairo",
    state: "Cairo",
    postalCode: "11511",
    country: "eg",
  },
  customerNote: "Please contact us about delivery timing.",
};

const validatedPayload = createBookRequestSchema.validate(validPayload);
assert.equal(validatedPayload.error, undefined);
assert.equal(validatedPayload.value.shipping.country, "EG");
assert.equal(
  bookRequestListQuerySchema.validate({}).value.lang,
  "en",
);
assert.equal(
  bookRequestDetailQuerySchema.validate({ lang: "ar" }).error,
  undefined,
);
assert.equal(bookRequestIdParamSchema.validate({ id: 1 }).error, undefined);

for (const privilegedField of [
  "userId",
  "price",
  "subtotal",
  "estimatedTotal",
  "finalTotal",
  "requestStatus",
  "paymentStatus",
  "adminInternalNote",
  "assignedAdminId",
  "payment",
]) {
  assert.ok(
    createBookRequestSchema.validate({
      ...validPayload,
      [privilegedField]: "spoofed",
    }).error,
    `Create payload must reject ${privilegedField}`,
  );
}
assert.ok(
  createBookRequestSchema.validate({
    ...validPayload,
    items: [{ bookId: 11, quantity: 300, unitPrice: "0.01" }],
  }).error,
  "Item price spoofing must be rejected",
);
assert.ok(
  createBookRequestSchema.validate({
    ...validPayload,
    items: [{ bookId: 11, quantity: 300, shippingCost: "0.00" }],
  }).error,
  "Item shipping spoofing must be rejected",
);
assert.ok(
  createBookRequestSchema.validate({
    ...validPayload,
    items: [
      { bookId: 11, quantity: 300 },
      { bookId: 11, quantity: 450 },
    ],
  }).error,
  "Duplicate book IDs must be rejected",
);
assert.ok(
  createBookRequestSchema.validate({
    ...validPayload,
    items: [{ bookId: 11, quantity: 0 }],
  }).error,
  "Quantity must be positive",
);

for (const layer of bookRequestRouter.stack) {
  if (!layer.route) continue;
  const handlerNames = layer.route.stack.map(({ handle }) => handle.name);
  assert.ok(
    handlerNames.includes("protect"),
    `${layer.route.path} must require authentication`,
  );
}

const ownershipQueries = [];
const notOwned = await getOwnBookRequestById(42, 900, {
  async query(sql, values) {
    ownershipQueries.push({ sql, values });
    return { rows: [] };
  },
});
assert.equal(notOwned, null);
assert.equal(ownershipQueries.length, 1);
assert.match(ownershipQueries[0].sql, /r\.id = \$1 AND r\.user_id = \$2/);
assert.deepEqual(ownershipQueries[0].values, [900, 42]);

const requestRow = {
  id: 900,
  reference_number: "SUBH-2026-000900",
  customer_full_name: "Example User",
  customer_email: "user@example.test",
  customer_phone: "+20 100 000 0000",
  customer_user_type: "individual",
  customer_company_name: null,
  request_status: "pending",
  contact_status: "not_contacted",
  payment_status: "not_required_yet",
  fulfillment_status: "not_started",
  quote_status: "not_prepared",
  estimated_subtotal: "7500.00",
  estimated_shipping_cost: "750.00",
  estimated_total: "8250.00",
  agreed_subtotal: null,
  shipping_cost: null,
  currency_code: "USD",
  shipping_recipient: "Example Recipient",
  shipping_company: null,
  shipping_phone: "+20 100 000 0000",
  shipping_address_line1: "10 Example Street",
  shipping_address_line2: null,
  shipping_city: "Cairo",
  shipping_state: "Cairo",
  shipping_postal_code: "11511",
  shipping_country: "EG",
  shipping_notes: null,
  customer_note: null,
  customer_visible_note: null,
  admin_internal_note: "must-not-leak",
  assigned_admin_id: 99,
  created_at: "2026-08-14T00:00:00.000Z",
  updated_at: "2026-08-14T00:00:00.000Z",
};
const itemRow = {
  id: 1,
  book_id: 11,
  book_name_en_snapshot: "English Snapshot",
  book_name_ar_snapshot: "لقطة عربية",
  isbn_snapshot: "9780000000001",
  requested_quantity: 300,
  unit_price_snapshot: "25.00",
  unit_shipping_cost_snapshot: "2.50",
  estimated_line_subtotal: "7500.00",
  estimated_line_shipping: "750.00",
};
const englishDetail = serializeBookRequestDetail(requestRow, [itemRow], "en");
const arabicDetail = serializeBookRequestDetail(requestRow, [itemRow], "ar");
assert.equal(englishDetail.items[0].name, "English Snapshot");
assert.equal(arabicDetail.items[0].name, "لقطة عربية");
assert.equal(Object.hasOwn(englishDetail.items[0], "bookNameEnSnapshot"), false);
assert.equal(Object.hasOwn(englishDetail.items[0], "bookNameArSnapshot"), false);
assert.equal(Object.hasOwn(englishDetail, "adminInternalNote"), false);
assert.equal(Object.hasOwn(englishDetail, "assignedAdminId"), false);

const transactionQueries = [];
let requestInsertValues;
let released = false;
const failingClient = {
  async query(sql, values = []) {
    const statement = sql.trim();
    transactionQueries.push(statement);
    if (statement === "BEGIN" || statement === "ROLLBACK") return { rows: [] };
    if (statement.includes("WITH requested AS")) {
      return {
        rows: [
          {
            book_id: 11,
            book_name_en_snapshot: "English One",
            book_name_ar_snapshot: "عربي واحد",
            isbn_snapshot: "9780000000001",
            requested_quantity: 300,
            unit_price_snapshot: "12.35",
            unit_shipping_cost_snapshot: "1.10",
            estimated_line_subtotal: "3705.00",
            estimated_line_shipping: "330.00",
          },
          {
            book_id: 12,
            book_name_en_snapshot: "English Two",
            book_name_ar_snapshot: "عربي اثنان",
            isbn_snapshot: "9780000000002",
            requested_quantity: 450,
            unit_price_snapshot: "3.33",
            unit_shipping_cost_snapshot: "0.25",
            estimated_line_subtotal: "1498.50",
            estimated_line_shipping: "112.50",
          },
        ],
      };
    }
    if (statement.includes("INSERT INTO book_requests")) {
      requestInsertValues = values;
      return { rows: [{ ...requestRow, id: 901 }] };
    }
    if (statement.includes("INSERT INTO book_request_items")) {
      throw new Error("Simulated item insert failure");
    }
    throw new Error(`Unexpected query: ${statement.slice(0, 40)}`);
  },
  release() {
    released = true;
  },
};

await assert.rejects(
  createCustomerBookRequest(
    {
      user: {
        id: 42,
        fullName: "Example User",
        email: "user@example.test",
        phoneNumber: "+20 100 000 0000",
        userType: "individual",
      },
      payload: validatedPayload.value,
    },
    { dbPool: { connect: async () => failingClient } },
  ),
  /Simulated item insert failure/,
);
assert.equal(
  transactionQueries.filter((query) => query.includes("FROM requested")).length,
  1,
  "Books must be loaded in one query",
);
assert.equal(requestInsertValues[6], "5203.50");
assert.equal(requestInsertValues[7], "442.50");
assert.equal(requestInsertValues[8], "5646.00");
assert.ok(transactionQueries.includes("ROLLBACK"));
assert.equal(transactionQueries.includes("COMMIT"), false);
assert.equal(released, true);

const missingBookQueries = [];
const missingBookClient = {
  async query(sql) {
    const statement = sql.trim();
    missingBookQueries.push(statement);
    if (statement === "BEGIN" || statement === "ROLLBACK") return { rows: [] };
    if (statement.includes("WITH requested AS")) {
      return {
        rows: [
          {
            book_id: 11,
            requested_quantity: 300,
            estimated_line_subtotal: "3705.00",
            estimated_line_shipping: "330.00",
          },
        ],
      };
    }
    throw new Error("A missing book must fail before inserts");
  },
  release() {},
};
await assert.rejects(
  createCustomerBookRequest(
    {
      user: {
        id: 42,
        fullName: "Example User",
        email: "user@example.test",
        phoneNumber: "+20 100 000 0000",
        userType: "individual",
      },
      payload: validatedPayload.value,
    },
    { dbPool: { connect: async () => missingBookClient } },
  ),
  (error) => error.code === "BOOK_NOT_FOUND",
);
assert.ok(missingBookQueries.includes("ROLLBACK"));
assert.equal(
  missingBookQueries.some((query) => query.includes("INSERT INTO")),
  false,
);

const modelSource = await readFile(
  new URL("../src/models/bookRequest.Model.js", import.meta.url),
  "utf8",
);
const insertColumns = modelSource.match(
  /INSERT INTO book_requests \(([\s\S]*?)\)\s*VALUES/,
)?.[1];
assert.ok(insertColumns);
for (const serverOwnedColumn of [
  "request_status",
  "contact_status",
  "payment_status",
  "fulfillment_status",
  "quote_status",
  "final_total",
  "assigned_admin_id",
  "admin_internal_note",
]) {
  assert.equal(
    insertColumns.includes(serverOwnedColumn),
    false,
    `${serverOwnedColumn} must retain its database-owned default/state`,
  );
}

console.log("Book Request verification passed");
