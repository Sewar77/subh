import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { adminOnly } from "../src/middleware/adminOnly.Middleware.js";
import { protect } from "../src/middleware/protect.Middleware.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
  matchesImageSignature,
} from "../src/middleware/uploadImage.Middleware.js";
import { validateMultipartBody } from "../src/middleware/validateMultipart.Middleware.js";
import {
  archiveMediaAsset,
  listMediaAssets,
  restoreMediaAsset,
  updateMediaAssetMetadata,
} from "../src/models/mediaAsset.Model.js";
import mediaAssetRouter from "../src/routes/mediaAsset.Routes.js";
import {
  archiveAdminMediaAsset,
  restoreAdminMediaAsset,
  uploadAndRegisterMediaAsset,
} from "../src/services/mediaAssets/mediaAssetService.js";
import { serializeMediaAsset } from "../src/utils/mediaAssetSerializer.js";
import {
  mediaAssetListQuerySchema,
  mediaAssetEmptyBodySchema,
  mediaAssetMetadataUpdateSchema,
  mediaAssetUploadMetadataSchema,
} from "../src/validation/mediaAsset.Validation.js";

const assetRow = (overrides = {}) => ({
  id: 7,
  secure_url: "https://res.cloudinary.com/example/image/upload/asset.webp",
  cloudinary_public_id: "uploads/asset",
  original_filename: "asset.png",
  display_name: "Asset",
  mime_type: "image/png",
  format: "webp",
  width: 1200,
  height: 800,
  bytes: "2048",
  alt_text_en: "English alternative",
  alt_text_ar: "Arabic alternative",
  source: "uploaded",
  uploaded_by_admin_id: 42,
  archived_at: null,
  created_at: "2026-08-20T10:00:00.000Z",
  updated_at: "2026-08-20T10:00:00.000Z",
  uploader_id: 42,
  uploader_name: "Administrator",
  ...overrides,
});

assert.deepEqual(ALLOWED_IMAGE_MIME_TYPES, [
  "image/jpeg",
  "image/png",
  "image/webp",
]);
assert.equal(MAX_IMAGE_UPLOAD_BYTES, 10 * 1024 * 1024);
assert.equal(
  matchesImageSignature(Buffer.from([0xff, 0xd8, 0xff]), "image/jpeg"),
  true,
);
assert.equal(
  matchesImageSignature(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "image/png",
  ),
  true,
);
assert.equal(
  matchesImageSignature(Buffer.from("RIFF0000WEBP"), "image/webp"),
  true,
);
assert.equal(
  matchesImageSignature(Buffer.from("not an image"), "image/png"),
  false,
);

assert.equal(
  mediaAssetListQuerySchema.validate({}).value.status,
  "active",
);
assert.deepEqual(
  mediaAssetListQuerySchema.validate({ page: "2", limit: "10", search: " hero ", status: "all" }).value,
  { page: 2, limit: 10, search: "hero", status: "all" },
);
assert.ok(mediaAssetListQuerySchema.validate({ limit: 101 }).error);
assert.ok(mediaAssetListQuerySchema.validate({ status: "deleted" }).error);
assert.equal(
  mediaAssetUploadMetadataSchema.validate({
    displayName: "Hero",
    altTextEn: "Hero image",
    altTextAr: "Hero Arabic",
  }).error,
  undefined,
);
for (const forbidden of [
  "source",
  "uploadedByAdminId",
  "url",
  "secureUrl",
  "publicId",
  "width",
  "height",
  "bytes",
  "format",
  "createdAt",
  "archived",
]) {
  assert.ok(
    mediaAssetUploadMetadataSchema.validate({ [forbidden]: "spoofed" }).error,
    `${forbidden} must not be accepted during upload`,
  );
  assert.ok(
    mediaAssetMetadataUpdateSchema.validate({ [forbidden]: "spoofed" }).error,
    `${forbidden} must remain immutable`,
  );
}
assert.equal(
  mediaAssetMetadataUpdateSchema.validate({ altTextEn: null }).error,
  undefined,
);
assert.ok(mediaAssetMetadataUpdateSchema.validate({}).error);
assert.ok(mediaAssetEmptyBodySchema.validate({ source: "uploaded" }).error);

const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "subh-media-validation-"));
const tempFile = path.join(tempDirectory, "invalid-upload.png");
await fs.writeFile(tempFile, "temporary");
let validationStatus;
await validateMultipartBody(mediaAssetUploadMetadataSchema)(
  { body: { source: "uploaded" }, file: { path: tempFile } },
  {
    status(code) {
      validationStatus = code;
      return this;
    },
    json() {
      return this;
    },
  },
  () => assert.fail("Invalid multipart metadata must not advance"),
);
assert.equal(validationStatus, 400);
await assert.rejects(fs.access(tempFile));
await fs.rmdir(tempDirectory);

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
let response = responseRecorder();
await protect({ cookies: {} }, response.response, () => {
  throw new Error("Anonymous media request must not continue");
});
assert.equal(response.state.statusCode, 401);
response = responseRecorder();
adminOnly({ user: { role: "user" } }, response.response, () => {
  throw new Error("Normal user must not reach Media Library routes");
});
assert.equal(response.state.statusCode, 403);
let adminAdvanced = false;
adminOnly({ user: { role: "admin" } }, responseRecorder().response, () => {
  adminAdvanced = true;
});
assert.equal(adminAdvanced, true);

const expectedRoutes = [
  ["get", "/admin/media-assets"],
  ["get", "/admin/media-assets/:id"],
  ["post", "/admin/media-assets/upload"],
  ["patch", "/admin/media-assets/:id"],
  ["patch", "/admin/media-assets/:id/archive"],
  ["patch", "/admin/media-assets/:id/restore"],
];
for (const [method, routePath] of expectedRoutes) {
  const layer = mediaAssetRouter.stack.find(
    (item) => item.route?.path === routePath && item.route.methods[method],
  );
  assert.ok(layer, `${method.toUpperCase()} ${routePath} is missing`);
  const handlers = layer.route.stack.map(({ handle }) => handle.name);
  assert.ok(handlers.includes("protect"), `${routePath} lacks authentication`);
  assert.ok(handlers.includes("adminOnly"), `${routePath} lacks admin authorization`);
}
assert.equal(
  mediaAssetRouter.stack.some((item) => item.route?.methods.delete),
  false,
);
const uploadRoute = mediaAssetRouter.stack.find(
  (item) => item.route?.path === "/admin/media-assets/upload",
);
const uploadHandlers = uploadRoute.route.stack.map(({ handle }) => handle.name);
assert.ok(uploadHandlers.includes("rateLimit"));
assert.ok(uploadHandlers.includes("verifyUploadedImage"));
assert.ok(uploadHandlers.includes("multipartBodyValidation"));

const listQueries = [];
const listDb = {
  async query(sql, values) {
    listQueries.push({ sql: sql.replace(/\s+/g, " ").trim(), values });
    if (sql.includes("COUNT")) return { rows: [{ total: 25 }] };
    return { rows: [assetRow()] };
  },
};
const listed = await listMediaAssets(
  { page: 2, limit: 10, search: "hero", status: "active" },
  listDb,
);
assert.deepEqual(listed.pagination, {
  page: 2,
  limit: 10,
  total: 25,
  totalPages: 3,
});
assert.deepEqual(listQueries[0].values, ["%hero%"]);
assert.deepEqual(listQueries[1].values, ["%hero%", 10, 10]);
assert.match(listQueries[0].sql, /archived_at IS NULL/);
for (const column of ["display_name", "original_filename", "alt_text_en", "alt_text_ar"]) {
  assert.match(listQueries[0].sql, new RegExp(column));
}
const archivedQueries = [];
await listMediaAssets(
  { page: 1, limit: 24, status: "archived" },
  { async query(sql) { archivedQueries.push(sql); return sql.includes("COUNT") ? { rows: [{ total: 0 }] } : { rows: [] }; } },
);
assert.match(archivedQueries[0], /archived_at IS NOT NULL/);
const allQueries = [];
await listMediaAssets(
  { page: 1, limit: 24, status: "all" },
  { async query(sql) { allQueries.push(sql); return sql.includes("COUNT") ? { rows: [{ total: 0 }] } : { rows: [] }; } },
);
assert.doesNotMatch(allQueries[0], /archived_at IS (?:NOT )?NULL/);

let registeredPayload;
const destroyed = [];
const uploaded = await uploadAndRegisterMediaAsset(
  {
    file: {
      path: "/temporary/asset.png",
      originalname: "../asset.png",
      mimetype: "image/png",
    },
    metadata: { displayName: "Reusable hero", altTextEn: "Hero" },
    uploaderAdminId: 42,
  },
  {
    uploadToCloudinary: async () => ({
      secure_url: "https://res.cloudinary.com/example/image/upload/asset.webp",
      public_id: "uploads/asset",
      format: "webp",
      width: 1200,
      height: 800,
      bytes: 2048,
    }),
    createUploadedMediaAsset: async (payload) => {
      registeredPayload = payload;
      return assetRow({
        original_filename: payload.originalFilename,
        display_name: payload.displayName,
        alt_text_en: payload.altTextEn,
      });
    },
    destroyCloudinaryAsset: async (publicId) => destroyed.push(publicId),
  },
);
assert.equal(uploaded.url.startsWith("https://"), true);
assert.equal(registeredPayload.originalFilename, "asset.png");
assert.equal(registeredPayload.uploadedByAdminId, 42);
assert.equal(Object.hasOwn(registeredPayload, "source"), false);
assert.equal(destroyed.length, 0);

let duplicateError;
try {
  await uploadAndRegisterMediaAsset(
    {
      file: { path: "/temporary/duplicate.png", originalname: "duplicate.png", mimetype: "image/png" },
      metadata: {},
      uploaderAdminId: 42,
    },
    {
      uploadToCloudinary: async () => ({
        secure_url: "https://res.cloudinary.com/example/duplicate.png",
        public_id: "uploads/duplicate",
      }),
      createUploadedMediaAsset: async () => {
        const error = new Error("duplicate key");
        error.code = "23505";
        throw error;
      },
      destroyCloudinaryAsset: async (publicId) => destroyed.push(publicId),
    },
  );
} catch (error) {
  duplicateError = error;
}
assert.equal(duplicateError?.code, "MEDIA_ASSET_DUPLICATE");
assert.equal(destroyed.at(-1), "uploads/duplicate");

let insertCalled = false;
await assert.rejects(
  uploadAndRegisterMediaAsset(
    {
      file: { path: "/temporary/failure.png", originalname: "failure.png", mimetype: "image/png" },
      uploaderAdminId: 42,
    },
    {
      uploadToCloudinary: async () => { throw new Error("provider unavailable"); },
      createUploadedMediaAsset: async () => { insertCalled = true; },
    },
  ),
  /provider unavailable/,
);
assert.equal(insertCalled, false);

const mutationDb = (archivedAt) => {
  const queries = [];
  return {
    queries,
    db: {
      async query(sql, values) {
        queries.push({ sql: sql.replace(/\s+/g, " ").trim(), values });
        if (sql.includes("UPDATE media_assets")) return { rows: [{ id: 7 }] };
        return { rows: [assetRow({ archived_at: archivedAt })] };
      },
    },
  };
};
const metadataDb = mutationDb(null);
const metadataAsset = await updateMediaAssetMetadata(
  7,
  { displayName: "Updated", altTextAr: null },
  metadataDb.db,
);
assert.equal(metadataAsset.id, 7);
assert.match(metadataDb.queries[0].sql, /display_name = \$2/);
assert.match(metadataDb.queries[0].sql, /alt_text_ar = \$3/);
assert.doesNotMatch(metadataDb.queries[0].sql, /secure_url|source|uploaded_by_admin_id/);
const archiveDb = mutationDb("2026-08-20T11:00:00.000Z");
assert.equal((await archiveMediaAsset(7, archiveDb.db)).archived_at !== null, true);
assert.match(archiveDb.queries[0].sql, /archived_at = COALESCE/);
const restoreDb = mutationDb(null);
assert.equal((await restoreMediaAsset(7, restoreDb.db)).archived_at, null);
assert.match(restoreDb.queries[0].sql, /archived_at = NULL/);

const archivedService = await archiveAdminMediaAsset(7, {
  archiveMediaAsset: async () => assetRow({ archived_at: "2026-08-20T11:00:00.000Z" }),
});
assert.equal(archivedService.archived, true);
const restoredService = await restoreAdminMediaAsset(7, {
  restoreMediaAsset: async () => assetRow({ archived_at: null }),
});
assert.equal(restoredService.archived, false);

const serialized = serializeMediaAsset(assetRow());
assert.deepEqual(Object.keys(serialized), [
  "id", "url", "publicId", "displayName", "originalFilename", "mimeType",
  "format", "width", "height", "bytes", "altTextEn", "altTextAr", "source",
  "archived", "archivedAt", "uploader", "createdAt", "updatedAt",
]);
const serializedJson = JSON.stringify(serialized);
for (const forbidden of [
  "apiKey",
  "apiSecret",
  "cloudName",
  "password",
  "hashedPassword",
  "email",
  "token",
]) {
  assert.equal(serializedJson.includes(forbidden), false);
}

const modelSource = await readFile(
  new URL("../src/models/mediaAsset.Model.js", import.meta.url),
  "utf8",
);
assert.doesNotMatch(modelSource, /SELECT\s+\*/i);
assert.doesNotMatch(modelSource, /DELETE\s+FROM\s+media_assets/i);
assert.match(modelSource, /WHERE asset\.id = \$1/);
assert.match(modelSource, /LIMIT \$\$?\{/);
assert.match(modelSource, /source,[\s\S]*'uploaded'/);
const cloudinarySource = await readFile(
  new URL("../src/services/cloudinary/cloudinaryServices.js", import.meta.url),
  "utf8",
);
assert.match(cloudinarySource, /unique_filename: true/);
assert.match(cloudinarySource, /overwrite: false/);
assert.match(cloudinarySource, /uploader\.destroy/);
const uploadMiddlewareSource = await readFile(
  new URL("../src/middleware/uploadImage.Middleware.js", import.meta.url),
  "utf8",
);
assert.match(uploadMiddlewareSource, /fileSize: MAX_IMAGE_UPLOAD_BYTES/);
assert.match(uploadMiddlewareSource, /Unsupported file type/);
const applicationSource = await readFile(
  new URL("../index.js", import.meta.url),
  "utf8",
);
assert.match(applicationSource, /LIMIT_FILE_SIZE[\s\S]*status\(413\)/);

console.log("Media Asset verification passed");
process.exit(0);
