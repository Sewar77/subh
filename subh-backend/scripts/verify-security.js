import assert from "node:assert/strict";
import { getAuthCookieOptions } from "../src/config/authCookie.js";
import {
  assertProductionSecurityConfig,
  createCorsOptions,
  getAllowedOrigins,
  requireTrustedMutationOrigin,
} from "../src/config/httpSecurity.js";
import authRouter from "../src/routes/auth.Routes.js";
import booksRouter from "../src/routes/books.Routes.js";
import categoriesRouter from "../src/routes/categories.Routes.js";
import pagesRouter from "../src/routes/pages.Routes.js";
import mediaAssetRouter from "../src/routes/mediaAsset.Routes.js";
import sectionRouter from "../src/routes/section.Routes.js";
import translationRouter from "../src/routes/sectionTranslation.Routes.js";
import uploadRouter from "../src/routes/uploadImage.Routes.js";
import userRouter from "../src/routes/user.Routes.js";
import { adminOnly } from "../src/middleware/adminOnly.Middleware.js";
import { protect } from "../src/middleware/protect.Middleware.js";

const invokeMiddleware = async (middleware, req) => {
  let status;
  let body;
  let nextCalled = false;
  await middleware(
    req,
    {
      status(value) {
        status = value;
        return this;
      },
      json(value) {
        body = value;
        return this;
      },
    },
    () => {
      nextCalled = true;
    },
  );
  return { status, body, nextCalled };
};

assert.equal(
  (await invokeMiddleware(protect, { cookies: {} })).status,
  401,
  "Anonymous protected requests must be rejected",
);
assert.equal(
  (await invokeMiddleware(adminOnly, { user: { role: "user" } })).status,
  403,
  "Authenticated non-admin users must be forbidden",
);
assert.equal(
  (await invokeMiddleware(adminOnly, { user: { role: "admin" } })).nextCalled,
  true,
);

const production = { NODE_ENV: "production" };
assert.throws(() => assertProductionSecurityConfig(production));
assert.equal(
  assertProductionSecurityConfig({
    NODE_ENV: "production",
    JWT_SECRET: "x".repeat(32),
    CORS_ORIGINS: "https://www.example.test",
  }),
  true,
);
assert.deepEqual(getAllowedOrigins(production), []);
assert.deepEqual(
  getAllowedOrigins({
    NODE_ENV: "production",
    CORS_ORIGINS: "https://www.example.test, https://admin.example.test",
  }),
  ["https://www.example.test", "https://admin.example.test"],
);

const cookie = getAuthCookieOptions({}, production);
assert.equal(cookie.httpOnly, true);
assert.equal(cookie.secure, true);
assert.equal(cookie.sameSite, "lax");
assert.equal(Object.hasOwn(cookie, "domain"), false);
assert.equal(
  getAuthCookieOptions({}, { NODE_ENV: "development" }).secure,
  false,
);

await new Promise((resolve, reject) => {
  createCorsOptions({
    NODE_ENV: "production",
    CORS_ORIGINS: "https://allowed.example.test",
  }).origin("https://evil.example.test", (error, allowed) => {
    try {
      assert.ok(error);
      assert.notEqual(allowed, true);
      resolve();
    } catch (assertionError) {
      reject(assertionError);
    }
  });
});

const invokeOriginGuard = ({ origin, fetchSite, cookies = {} }) => {
  let status;
  let body;
  let nextCalled = false;
  const middleware = requireTrustedMutationOrigin({
    NODE_ENV: "production",
    CORS_ORIGINS: "https://allowed.example.test",
  });
  middleware(
    {
      method: "PATCH",
      cookies,
      get(name) {
        if (name === "origin") return origin;
        if (name === "sec-fetch-site") return fetchSite;
        return undefined;
      },
    },
    {
      status(value) {
        status = value;
        return this;
      },
      json(value) {
        body = value;
        return this;
      },
    },
    () => {
      nextCalled = true;
    },
  );
  return { status, body, nextCalled };
};

assert.equal(
  invokeOriginGuard({
    origin: "https://allowed.example.test",
    fetchSite: "same-site",
    cookies: { token: "redacted" },
  }).nextCalled,
  true,
);
assert.equal(
  invokeOriginGuard({
    origin: "https://evil.example.test",
    fetchSite: "cross-site",
    cookies: { token: "redacted" },
  }).status,
  403,
);
assert.equal(
  invokeOriginGuard({ cookies: { token: "redacted" } }).status,
  403,
);

const assertAdminMutations = (router) => {
  for (const layer of router.stack) {
    if (!layer.route) continue;
    const methods = Object.keys(layer.route.methods);
    if (!methods.some((method) => ["post", "put", "patch", "delete"].includes(method))) {
      continue;
    }
    if (String(layer.route.path).startsWith("/auth/")) continue;
    const handlers = layer.route.stack.map(({ handle }) => handle.name);
    assert.ok(handlers.includes("protect"), `${layer.route.path} lacks protect`);
    assert.ok(handlers.includes("adminOnly"), `${layer.route.path} lacks adminOnly`);
  }
};

for (const router of [
  booksRouter,
  categoriesRouter,
  pagesRouter,
  mediaAssetRouter,
  sectionRouter,
  translationRouter,
  uploadRouter,
  userRouter,
]) {
  assertAdminMutations(router);
}

for (const path of ["/auth/register", "/auth/login"]) {
  const layer = authRouter.stack.find((item) => item.route?.path === path);
  assert.ok(layer.route.stack.some(({ handle }) => handle.name === "rateLimit"));
}

console.log("Security verification passed");
