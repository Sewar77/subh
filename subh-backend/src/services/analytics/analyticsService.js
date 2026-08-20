import {
  ANALYTICS_DEFAULT_TIMEZONE,
  ANALYTICS_LOYAL_PURCHASE_THRESHOLD,
  ANALYTICS_MAX_RANGE_DAYS,
} from "../../config/analytics.js";
import * as repository from "../../models/analytics.Model.js";

const nullableText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

export const sanitizeAnalyticsPath = (value) => {
  const path = nullableText(value);
  if (!path) return null;
  const clean = path.split(/[?#]/, 1)[0].replace(/\/{2,}/g, "/");
  return clean.startsWith("/") ? clean.slice(0, 500) : null;
};

const zonedParts = (date, timeZone) => Object.fromEntries(
  new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, Number(value)]),
);

const localMidnightToUtc = (year, month, day, timeZone) => {
  const target = Date.UTC(year, month - 1, day);
  let guess = target;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = zonedParts(new Date(guess), timeZone);
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    guess = target - (represented - guess);
  }
  return new Date(guess);
};

const parseLocalDate = (value) => {
  const match = String(value || "").slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw Object.assign(new Error("Invalid analytics date"), { status: 400, publicMessage: "Invalid analytics date range" });
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
};

const addLocalDays = ({ year, month, day }, days) => {
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
};

export const buildAnalyticsRange = (query = {}, now = new Date()) => {
  const preset = query.preset || "30d";
  const timezone = query.timezone || ANALYTICS_DEFAULT_TIMEZONE;
  let currentStart;
  let currentEnd = new Date(now);

  if (preset === "custom") {
    const from = parseLocalDate(query.dateFrom);
    const toExclusive = addLocalDays(parseLocalDate(query.dateTo), 1);
    currentStart = localMidnightToUtc(from.year, from.month, from.day, timezone);
    currentEnd = localMidnightToUtc(toExclusive.year, toExclusive.month, toExclusive.day, timezone);
  } else if (preset === "year") {
    const currentLocal = zonedParts(now, timezone);
    currentStart = localMidnightToUtc(currentLocal.year, 1, 1, timezone);
  } else {
    const days = Number.parseInt(preset, 10);
    currentStart = new Date(currentEnd.getTime() - days * 86_400_000);
  }

  const duration = currentEnd - currentStart;
  if (duration <= 0 || duration > (ANALYTICS_MAX_RANGE_DAYS + 1) * 86_400_000) {
    throw Object.assign(new Error("Analytics range is outside supported bounds"), {
      status: 400,
      publicMessage: `Analytics range must be between one and ${ANALYTICS_MAX_RANGE_DAYS} days`,
    });
  }
  return {
    preset,
    timezone,
    currentStart,
    currentEnd,
    previousStart: new Date(currentStart.getTime() - duration),
    previousEnd: currentStart,
  };
};

const rangeResponse = (range) => ({
  preset: range.preset,
  timezone: range.timezone,
  currentStart: range.currentStart.toISOString(),
  currentEnd: range.currentEnd.toISOString(),
  previousStart: range.previousStart.toISOString(),
  previousEnd: range.previousEnd.toISOString(),
});

const camelKey = (key) => key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
const camelRow = (row = {}) => Object.fromEntries(
  Object.entries(row).map(([key, value]) => [camelKey(key), value]),
);
const camelRows = (rows = []) => rows.map(camelRow);

export const comparisonMetric = (currentValue, previousValue) => {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);
  const difference = current - previous;
  return {
    current,
    previous,
    difference,
    percentageChange: previous === 0 ? (current === 0 ? 0 : null) : (difference / Math.abs(previous)) * 100,
  };
};

export const safePercentage = (numerator, denominator) => {
  const total = Number(denominator || 0);
  return total > 0 ? (Number(numerator || 0) / total) * 100 : 0;
};

export const recordAnalyticsEvent = (payload, userId, options = {}) => repository.ingestAnalyticsEvent({
  ...payload,
  userId: userId || null,
  pagePath: sanitizeAnalyticsPath(payload.pagePath),
  landingPath: sanitizeAnalyticsPath(payload.landingPath),
  referrerHost: nullableText(payload.referrerHost),
  utmSource: nullableText(payload.utmSource),
  utmMedium: nullableText(payload.utmMedium),
  utmCampaign: nullableText(payload.utmCampaign),
  entityType: payload.entityType || null,
  entityId: payload.entityId || null,
}, options.dbPool);

const moneyRows = (rows, source) => camelRows(rows.filter((row) => !source || row.source === source));

const combinedRevenueByCurrency = (rows) => {
  const currencies = new Map();
  for (const row of camelRows(rows)) {
    const current = currencies.get(row.currencyCode) || { current: 0, previous: 0 };
    current.current += Number(row.revenueCurrent || 0);
    current.previous += Number(row.revenuePrevious || 0);
    currencies.set(row.currencyCode, current);
  }
  return [...currencies].map(([currencyCode, values]) => ({ currencyCode, ...comparisonMetric(values.current, values.previous) }));
};

export const getAnalyticsOverview = async (query, options = {}) => {
  const range = buildAnalyticsRange(query, options.now);
  const raw = await repository.getOverviewMetrics(range, options.db);
  const traffic = camelRow(raw.traffic);
  const users = camelRow(raw.users);
  const requests = camelRow(raw.requests);
  const workshops = camelRow(raw.workshops);
  return {
    range: rangeResponse(range),
    traffic: {
      uniqueVisitors: comparisonMetric(traffic.visitorsCurrent, traffic.visitorsPrevious),
      sessions: comparisonMetric(traffic.sessionsCurrent, traffic.sessionsPrevious),
      pageViews: comparisonMetric(raw.pageViews.current, raw.pageViews.previous),
      knownUsers: comparisonMetric(traffic.knownCurrent, traffic.knownPrevious),
      newVisitors: Number(raw.visitorTypes.new_visitors || 0),
      returningVisitors: Number(raw.visitorTypes.returning_visitors || 0),
    },
    users: {
      totalAccounts: Number(users.totalAccounts || 0),
      newAccounts: comparisonMetric(users.newCurrent, users.newPrevious),
      individuals: Number(users.individuals || 0),
      companies: Number(users.companies || 0),
      activeAccounts: Number(users.activeAccounts || 0),
      inactiveAccounts: Number(users.inactiveAccounts || 0),
    },
    bookRequests: {
      created: comparisonMetric(requests.requestsCurrent, requests.requestsPrevious),
      purchasingCustomers: comparisonMetric(requests.purchasersCurrent, requests.purchasersPrevious),
      totalQuantity: Number(requests.quantityCurrent || 0),
      moneyByCurrency: moneyRows(raw.money, "book_request"),
    },
    workshops: {
      bookings: comparisonMetric(workshops.bookingsCurrent, workshops.bookingsPrevious),
      confirmed: Number(workshops.confirmedCurrent || 0),
      awaitingPayment: Number(workshops.awaitingPaymentCurrent || 0),
      revenueByCurrency: moneyRows(raw.money, "workshop"),
    },
    financials: {
      revenueByCurrency: combinedRevenueByCurrency(raw.money),
      bookRequestOutstandingByCurrency: moneyRows(raw.money, "book_request").map((row) => ({ currencyCode: row.currencyCode, current: Number(row.outstandingCurrent || 0) })),
    },
  };
};

export const getAnalyticsTraffic = async (query, options = {}) => {
  const range = buildAnalyticsRange(query, options.now);
  const raw = await repository.getTrafficMetrics(range, options.db);
  return {
    range: rangeResponse(range),
    trend: camelRows(raw.trend),
    topPages: camelRows(raw.pages),
    devices: camelRows(raw.devices),
    languages: camelRows(raw.languages),
    referrers: camelRows(raw.referrers),
    campaigns: camelRows(raw.campaigns),
  };
};

export const getAnalyticsCustomers = async (query, options = {}) => {
  const range = buildAnalyticsRange(query, options.now);
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const segment = query.segment || "all";
  const raw = await repository.getCustomerMetrics(range, { page, limit, segment }, options.db);
  const customers = camelRows(raw.customers).map(({ totalCount, ...customer }) => customer);
  const total = Number(raw.customers[0]?.total_count || 0);
  return {
    range: rangeResponse(range),
    definitions: {
      requestOnly: "One or more Book Requests and zero requests with positive canonical net paid.",
      oneTime: "Exactly one Book Request with positive canonical net paid.",
      repeat: "Two or more Book Requests with positive canonical net paid.",
      loyal: `${ANALYTICS_LOYAL_PURCHASE_THRESHOLD} or more Book Requests with positive canonical net paid.`,
      highValue: "Purchasing customers ranked by authoritative lifetime net paid.",
    },
    summary: camelRow(raw.summary),
    customers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getAnalyticsBookRequests = async (query, options = {}) => {
  const range = buildAnalyticsRange(query, options.now);
  const raw = await repository.getBookRequestMetrics(range, options.db);
  const summary = camelRow(raw.summary);
  const viewed = Number(raw.funnel.book_viewed || 0);
  const started = Number(raw.funnel.request_started || 0);
  const submitted = Number(summary.submittedCustomers || 0);
  const purchased = Number(summary.purchasingCustomers || 0);
  return {
    range: rangeResponse(range),
    purchaseDefinition: "Positive book_request_payment_summary.net_paid, payment status partially_paid or paid, and request not cancelled or rejected.",
    summary: {
      ...summary,
      requestConversionRate: safePercentage(purchased, submitted),
    },
    moneyByCurrency: camelRows(raw.monetary),
    statuses: camelRows(raw.statuses),
    funnel: [
      { stage: "bookViewed", count: viewed, source: "analytics", conversionFromPrevious: 100 },
      { stage: "requestStarted", count: started, source: "analytics", conversionFromPrevious: safePercentage(started, viewed) },
      { stage: "requestSubmitted", count: submitted, source: "business", conversionFromPrevious: safePercentage(submitted, started) },
      { stage: "purchased", count: purchased, source: "business", conversionFromPrevious: safePercentage(purchased, submitted) },
    ],
    topBooks: camelRows(raw.books),
    topCategories: camelRows(raw.categories),
  };
};

export const getAnalyticsWorkshops = async (query, options = {}) => {
  const range = buildAnalyticsRange(query, options.now);
  const raw = await repository.getWorkshopMetrics(range, options.db);
  const summary = camelRow(raw.summary);
  const occupancy = camelRow(raw.occupancy);
  const attendance = camelRow(raw.attendance);
  const viewed = Number(raw.funnel.viewed || 0);
  const started = Number(raw.funnel.started || 0);
  const submitted = Number(summary.submittedCustomers || 0);
  const paid = Number(summary.paymentConfirmedCustomers || 0);
  const attended = Number(attendance.attendedCustomers || 0);
  return {
    range: rangeResponse(range),
    summary,
    revenueByCurrency: camelRows(raw.monetary),
    occupancy: {
      ...occupancy,
      reservedRate: safePercentage(occupancy.reserved, occupancy.capacity),
      confirmedRate: safePercentage(occupancy.confirmed, occupancy.capacity),
      definition: "Reserved occupancy includes pending, awaiting payment, and confirmed bookings; confirmed occupancy includes confirmed and completed bookings.",
    },
    attendance: {
      ...attendance,
      attendanceRate: safePercentage(attendance.attended, Number(attendance.attended || 0) + Number(attendance.noShow || 0)),
      definition: "Attendance rate is attended divided by attended plus no-show for ended, non-cancelled and non-rejected bookings. Not-marked is reported separately.",
    },
    funnel: [
      { stage: "workshopViewed", count: viewed, source: "analytics", conversionFromPrevious: 100 },
      { stage: "bookingStarted", count: started, source: "analytics", conversionFromPrevious: safePercentage(started, viewed) },
      { stage: "bookingSubmitted", count: submitted, source: "business", conversionFromPrevious: safePercentage(submitted, started) },
      { stage: "paymentConfirmed", count: paid, source: "business", conversionFromPrevious: safePercentage(paid, submitted) },
      { stage: "attended", count: attended, source: "business", conversionFromPrevious: safePercentage(attended, paid) },
    ],
    topWorkshops: camelRows(raw.workshops),
    topSessions: camelRows(raw.sessions),
    categories: camelRows(raw.categories),
    presenters: camelRows(raw.presenters),
    modes: camelRows(raw.modes),
    attendeeSegments: camelRow(raw.attendees),
    demographics: camelRows(raw.demographics),
  };
};
