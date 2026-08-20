import Joi from "joi";

const nullableMetadata = (maxLength) =>
  Joi.string().trim().min(1).max(maxLength).allow(null);

export const mediaAssetListQuerySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().min(1).max(100).default(24),
  search: Joi.string().trim().max(200).allow("").default(""),
  status: Joi.string().valid("active", "archived", "all").default("active"),
}).unknown(false);

export const mediaAssetIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).unknown(false);

export const mediaAssetUploadMetadataSchema = Joi.object({
  displayName: nullableMetadata(200),
  altTextEn: nullableMetadata(500),
  altTextAr: nullableMetadata(500),
}).unknown(false);

export const mediaAssetMetadataUpdateSchema = Joi.object({
  displayName: nullableMetadata(200),
  altTextEn: nullableMetadata(500),
  altTextAr: nullableMetadata(500),
})
  .min(1)
  .unknown(false);

export const mediaAssetEmptyBodySchema = Joi.object({}).unknown(false);
