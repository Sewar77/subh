import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import analyticsRouter from "../src/routes/analytics.Routes.js";
import {
  ANALYTICS_EVENT_NAMES,
  PURCHASED_BOOK_REQUEST_SQL,
} from "../src/config/analytics.js";
import { analyticsEventSchema, analyticsRangeSchema } from "../src/validation/analytics.Validation.js";
import {
  buildAnalyticsRange,
  comparisonMetric,
  getAnalyticsCustomers,
  getAnalyticsTraffic,
  recordAnalyticsEvent,
  safePercentage,
  sanitizeAnalyticsPath,
} from "../src/services/analytics/analyticsService.js";

const uuid = (suffix) => `123e4567-e89b-42d3-a456-426614174${suffix}`;
const validEvent = {
  eventKey: uuid("000"), visitorKey: uuid("001"), sessionKey: uuid("002"),
  eventName: "book_view", eventVersion: 1, pagePath: "/books/2?secret=no",
  locale: "en", entityType: "book", entityId: 2, properties: {},
  landingPath: "/books", deviceCategory: "desktop",
};

assert.equal(analyticsEventSchema.validate(validEvent).error, undefined);
for (const field of ["userId", "email", "phone", "password", "token", "occurredAt"]) {
  assert.ok(analyticsEventSchema.validate({ ...validEvent, [field]: "spoofed" }).error, `${field} must be rejected`);
}
assert.ok(analyticsEventSchema.validate({ ...validEvent, eventName: "payment_confirmed" }).error);
assert.ok(analyticsEventSchema.validate({ ...validEvent, eventKey: "bad" }).error);
assert.ok(analyticsEventSchema.validate({ ...validEvent, entityType: "workshop" }).error);
assert.ok(analyticsEventSchema.validate({ ...validEvent, properties: { email: "private@example.test" } }).error);
assert.ok(analyticsEventSchema.validate({ ...validEvent, properties: { resultCount: "1" } }).error);
assert.ok(analyticsEventSchema.validate({ ...validEvent, properties: { value: "x".repeat(3000) } }).error);
assert.equal(ANALYTICS_EVENT_NAMES.length, 15);

assert.equal(sanitizeAnalyticsPath("/books/2?email=private#fragment"), "/books/2");
assert.equal(sanitizeAnalyticsPath("https://example.test/private"), null);
assert.equal(safePercentage(1, 0), 0);
assert.equal(safePercentage(1, 4), 25);
assert.deepEqual(comparisonMetric(5, 0), { current: 5, previous: 0, difference: 5, percentageChange: null });
assert.equal(comparisonMetric(15, 10).percentageChange, 50);

const range = buildAnalyticsRange({ preset: "30d", timezone: "Africa/Cairo" }, new Date("2026-08-21T12:00:00.000Z"));
assert.equal(range.currentEnd.toISOString(), "2026-08-21T12:00:00.000Z");
assert.equal((range.currentEnd - range.currentStart) / 86_400_000, 30);
assert.equal(analyticsRangeSchema.validate({ preset: "custom", dateFrom: "2026-01-01", dateTo: "2027-12-31" }).error != null, true);
assert.equal(analyticsRangeSchema.validate({ preset: "custom", dateFrom: "2026-08-01", dateTo: "2026-08-20", timezone: "Africa/Cairo" }).error, undefined);

const queryCalls = [];
const postgresContractDb = {
  async query(sql, values = []) {
    const placeholders = [...sql.matchAll(/\$(\d+)/g)].map((match) => Number(match[1]));
    const maximumPlaceholder = placeholders.length ? Math.max(...placeholders) : 0;
    assert.equal(values.length, maximumPlaceholder, "PostgreSQL bind value count must match the highest placeholder");
    for (let index = 1; index <= maximumPlaceholder; index += 1) {
      assert.ok(placeholders.includes(index), `PostgreSQL parameter $${index} must not be left untyped`);
    }
    assert.doesNotMatch(sql, /date_trunc\([^\n]+\)\s+day,/i, "date aliases must use explicit AS syntax");
    queryCalls.push({ sql, values });
    if (sql.includes("FROM customer_stats") && !sql.includes("COUNT(*) OVER()")) {
      return { rows: [{ request_only: 0, one_time: 0, repeat: 0, loyal: 0, individuals: 0, companies: 0 }] };
    }
    return { rows: [] };
  },
};

const emptyTraffic = await getAnalyticsTraffic({ preset: "30d", timezone: "Africa/Cairo" }, { db: postgresContractDb, now: new Date("2026-08-21T12:00:00.000Z") });
assert.deepEqual(emptyTraffic.trend, []);
assert.ok(queryCalls.some(({ values }) => values[2] === "Africa/Cairo"), "traffic trend must bind the requested IANA timezone");
const emptyCustomers = await getAnalyticsCustomers({ preset: "30d", timezone: "Africa/Cairo", segment: "all", page: 1, limit: 20 }, { db: postgresContractDb, now: new Date("2026-08-21T12:00:00.000Z") });
assert.deepEqual(emptyCustomers.customers, []);
assert.deepEqual(emptyCustomers.pagination, { page: 1, limit: 20, total: 0, totalPages: 0 });
assert.ok(queryCalls.some(({ sql, values }) => sql.includes("LIMIT $2 OFFSET $3") && values.length === 3), "customer pagination must use contiguous PostgreSQL parameters");
assert.ok(queryCalls.some(({ sql }) => sql.includes("payment.net_paid") && sql.includes("payment.remaining_balance")), "customer segmentation must use canonical payment summary columns");

const makePool = ({ duplicate = false, sessionMismatch = false } = {}) => {
  const calls = [];
  const client = {
    async query(sql, values = []) {
      const compact = sql.replace(/\s+/g, " ").trim();
      calls.push({ sql: compact, values });
      if (compact.startsWith("INSERT INTO analytics_visitors")) return { rows: [{ id: 7 }], rowCount: 1 };
      if (compact.startsWith("INSERT INTO analytics_sessions")) return { rows: sessionMismatch ? [] : [{ id: 9 }], rowCount: sessionMismatch ? 0 : 1 };
      if (compact.startsWith("INSERT INTO analytics_events")) return { rows: duplicate ? [] : [{ id: 11 }], rowCount: duplicate ? 0 : 1 };
      return { rows: [], rowCount: 0 };
    },
    release() {},
  };
  return { calls, pool: { async connect() { return client; } } };
};

const createdPool = makePool();
const created = await recordAnalyticsEvent(validEvent, 42, { dbPool: createdPool.pool });
assert.deepEqual(created, { accepted: true, duplicate: false });
const eventInsert = createdPool.calls.find(({ sql }) => sql.startsWith("INSERT INTO analytics_events"));
assert.equal(eventInsert.values[3], 42, "authenticated user must be supplied by server context");
assert.equal(eventInsert.values[6], "/books/2", "query strings must be removed");
assert.ok(createdPool.calls.some(({ sql }) => sql === "COMMIT"));

const duplicatePool = makePool({ duplicate: true });
assert.deepEqual(await recordAnalyticsEvent(validEvent, null, { dbPool: duplicatePool.pool }), { accepted: true, duplicate: true });
const mismatchPool = makePool({ sessionMismatch: true });
await assert.rejects(() => recordAnalyticsEvent(validEvent, null, { dbPool: mismatchPool.pool }), (error) => error.code === "ANALYTICS_SESSION_MISMATCH");
assert.ok(mismatchPool.calls.some(({ sql }) => sql === "ROLLBACK"));

const routes = analyticsRouter.stack.filter((layer) => layer.route).map((layer) => ({ path: layer.route.path, handlers: layer.route.stack.map(({ handle }) => handle.name) }));
const ingestionRoute = routes.find(({ path }) => path === "/analytics/events");
assert.ok(ingestionRoute.handlers.includes("rateLimit"));
assert.ok(ingestionRoute.handlers.includes("optionalAuth"));
for (const route of routes.filter(({ path }) => path.startsWith("/admin/analytics"))) {
  assert.ok(route.handlers.includes("protect"), `${route.path} lacks protect`);
  assert.ok(route.handlers.includes("adminOnly"), `${route.path} lacks adminOnly`);
}

const modelSource = await readFile(new URL("../src/models/analytics.Model.js", import.meta.url), "utf8");
assert.doesNotMatch(modelSource, /SELECT\s+\*/i);
assert.match(modelSource, /ON CONFLICT \(event_key\) DO NOTHING/);
assert.match(modelSource, /record_status='recorded'/);
assert.match(modelSource, /payment_kind WHEN 'payment' THEN/);
assert.match(modelSource, /booking_status IN \('pending','awaiting_payment','confirmed'\)/);
assert.match(modelSource, /booking_status IN \('confirmed','completed'\)/);
assert.match(modelSource, /booking_status NOT IN \('cancelled','rejected'\)/);
assert.match(PURCHASED_BOOK_REQUEST_SQL, /net_paid/);
assert.match(PURCHASED_BOOK_REQUEST_SQL, /partially_paid/);

console.log("Analytics verification passed (privacy, validation, identity, idempotency, admin authorization, date math, and business formulas). ");
