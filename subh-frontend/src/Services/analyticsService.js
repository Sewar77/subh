import { api } from "../../api.js";

export const ANALYTICS_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const VISITOR_KEY = "subh.analytics.visitor";
const SESSION_KEY = "subh.analytics.session";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let volatileVisitor = null;
let volatileSession = null;
const recentEvents = new Map();
let lastTrackedPage = null;

const uuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
};

const readStorage = (storage, key) => {
  try {
    return storage?.getItem(key) || null;
  } catch {
    return null;
  }
};

const writeStorage = (storage, key, value) => {
  try {
    storage?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const getVisitorKey = () => {
  const storage = globalThis.localStorage;
  const stored = readStorage(storage, VISITOR_KEY);
  if (UUID_PATTERN.test(stored || "")) return stored;
  if (!volatileVisitor) volatileVisitor = uuid();
  writeStorage(storage, VISITOR_KEY, volatileVisitor);
  return volatileVisitor;
};

export const getAnalyticsIdentity = (now = Date.now()) => {
  const storage = globalThis.sessionStorage;
  const stored = (() => {
    try {
      return JSON.parse(readStorage(storage, SESSION_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const valid = UUID_PATTERN.test(stored?.key || "") &&
    Number.isFinite(stored?.lastActivity) &&
    now - stored.lastActivity < ANALYTICS_SESSION_TIMEOUT_MS &&
    now >= stored.lastActivity;
  if (!valid) {
    volatileSession = { key: uuid(), lastActivity: now };
  } else {
    volatileSession = { key: stored.key, lastActivity: now };
  }
  writeStorage(storage, SESSION_KEY, JSON.stringify(volatileSession));
  return { visitorKey: getVisitorKey(), sessionKey: volatileSession.key };
};

export const sanitizePagePath = (value) => {
  const path = String(value || "/").split(/[?#]/, 1)[0].replace(/\/{2,}/g, "/");
  return path.startsWith("/") ? path.slice(0, 500) : "/";
};

const browserContext = () => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const referrerHost = (() => {
    try {
      return document.referrer ? new URL(document.referrer).hostname : null;
    } catch {
      return null;
    }
  })();
  const width = window.innerWidth;
  const deviceCategory = width < 600 ? "mobile" : width < 1024 ? "tablet" : "desktop";
  return {
    landingPath: sanitizePagePath(window.location.pathname),
    referrerHost,
    utmSource: params.get("utm_source")?.slice(0, 120) || null,
    utmMedium: params.get("utm_medium")?.slice(0, 120) || null,
    utmCampaign: params.get("utm_campaign")?.slice(0, 160) || null,
    deviceCategory,
  };
};

const isAdminPath = (path) => path === "/admin" || path.startsWith("/admin/");

export const trackEvent = async (eventName, options = {}) => {
  const pagePath = sanitizePagePath(options.pagePath || globalThis.location?.pathname || "/");
  if (isAdminPath(pagePath)) return false;
  const dedupeKey = options.dedupeKey;
  const now = Date.now();
  if (dedupeKey && now - (recentEvents.get(dedupeKey) || 0) < 1500) return false;
  if (dedupeKey) recentEvents.set(dedupeKey, now);

  const identity = getAnalyticsIdentity(now);
  const payload = {
    eventKey: uuid(),
    ...identity,
    eventName,
    eventVersion: 1,
    pagePath,
    locale: options.locale === "ar" ? "ar" : "en",
    ...(options.entityType && options.entityId ? { entityType: options.entityType, entityId: Number(options.entityId) } : {}),
    properties: options.properties || {},
    ...browserContext(),
  };
  try {
    await api.post("/analytics/events", payload);
    return true;
  } catch {
    return false;
  }
};

export const trackPageView = (pagePath, locale) => {
  const sanitized = sanitizePagePath(pagePath);
  if (lastTrackedPage === sanitized) return Promise.resolve(false);
  lastTrackedPage = sanitized;
  return trackEvent("page_view", { pagePath: sanitized, locale, dedupeKey: `page:${sanitized}` });
};

export const trackEntityView = (entityType, entityId, locale, pagePath) => trackEvent(`${entityType}_view`, {
  entityType,
  entityId,
  locale,
  pagePath,
  dedupeKey: `view:${entityType}:${entityId}:${sanitizePagePath(pagePath)}`,
});

export const __resetAnalyticsForTests = () => {
  volatileVisitor = null;
  volatileSession = null;
  lastTrackedPage = null;
  recentEvents.clear();
};
