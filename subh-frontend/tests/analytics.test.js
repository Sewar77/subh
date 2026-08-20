import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { api } from "../api.js";
import {
  ANALYTICS_SESSION_TIMEOUT_MS,
  __resetAnalyticsForTests,
  getAnalyticsIdentity,
  sanitizePagePath,
  trackEvent,
  trackPageView,
} from "../src/Services/analyticsService.js";
import { formatAnalyticsNumber, formatAnalyticsPercent, getAnalyticsCopy } from "../src/Utils/analyticsI18n.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), clear: () => values.clear() };
};

test("analytics identity persists visitor and rotates after 30 minutes", () => {
  globalThis.localStorage = memoryStorage();
  globalThis.sessionStorage = memoryStorage();
  __resetAnalyticsForTests();
  const first = getAnalyticsIdentity(1_000);
  const active = getAnalyticsIdentity(1_000 + ANALYTICS_SESSION_TIMEOUT_MS - 1);
  const expired = getAnalyticsIdentity(1_000 + ANALYTICS_SESSION_TIMEOUT_MS * 2);
  assert.equal(first.visitorKey, active.visitorKey);
  assert.equal(first.sessionKey, active.sessionKey);
  assert.equal(expired.visitorKey, first.visitorKey);
  assert.notEqual(expired.sessionKey, first.sessionKey);
});

test("tracking is non-blocking, excludes admin routes, and strips query data", async () => {
  globalThis.localStorage = memoryStorage();
  globalThis.sessionStorage = memoryStorage();
  globalThis.location = { pathname: "/books/2", search: "?utm_source=newsletter" };
  globalThis.window = { location: globalThis.location, innerWidth: 1200 };
  globalThis.document = { referrer: "https://example.test/source" };
  __resetAnalyticsForTests();
  const payloads = [];
  const originalPost = api.post;
  api.post = async (_, payload) => { payloads.push(payload); return { data: { accepted: true } }; };
  assert.equal(await trackEvent("page_view", { pagePath: "/admin/analytics", locale: "en" }), false);
  assert.equal(payloads.length, 0);
  assert.equal(await trackEvent("book_view", { pagePath: "/books/2?email=private", locale: "ar", entityType: "book", entityId: 2 }), true);
  assert.equal(payloads[0].pagePath, "/books/2");
  assert.equal(Object.hasOwn(payloads[0], "userId"), false);
  assert.deepEqual(payloads[0].properties, {});
  __resetAnalyticsForTests();
  await trackPageView("/books", "en");
  await trackPageView("/books", "ar");
  assert.equal(payloads.filter(({ eventName }) => eventName === "page_view").length, 1, "language rerenders must not duplicate page views");
  api.post = originalPost;
});

test("analytics formatting and Arabic copy avoid invalid percentages", () => {
  assert.equal(formatAnalyticsPercent(0, "en"), "0%");
  assert.doesNotMatch(formatAnalyticsPercent(0 / 0, "en"), /NaN|Infinity/);
  assert.match(formatAnalyticsNumber(1234, "ar"), /[٠-٩]/);
  assert.equal(getAnalyticsCopy("ar").title, "التحليلات");
  assert.equal(sanitizePagePath("/workshops/2?meeting=private#x"), "/workshops/2");
});

test("Analytics route is lazy and Workshop session cards are responsive and private", () => {
  const app = read("src/App.jsx");
  const sidebar = read("src/components/Admin/Layout/AdminSidebar.jsx");
  const detail = read("src/Pages/Workshops/WorkshopDetailPage.jsx");
  const card = read("src/components/Workshops/WorkshopSessionCard.jsx");
  assert.match(app, /const AdminAnalyticsPage = lazy/);
  assert.match(app, /path="analytics"/);
  assert.match(sidebar, /\/admin\/analytics/);
  assert.match(detail, /repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(detail, /repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(card, /grid|Paper/);
  assert.doesNotMatch(card, /meetingLink|locationInstructions/);
});
