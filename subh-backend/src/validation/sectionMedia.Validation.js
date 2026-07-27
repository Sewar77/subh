import Joi from "joi";

const executableExtensionPattern =
  /\.(?:asp|aspx|bat|cmd|com|cpl|css|exe|hta|html?|jar|js|jse|jsp|mjs|msi|php\d?|phtml|pl|ps1|py|pyw|rb|scr|sh|svg|vbs|wasm|wsf|xml)(?:[?#].*)?$/i;
const approvedFileRefPattern = /^(?:https?:\/\/|\/)(?!\/)/i;

const safeFileReference = Joi.string()
  .trim()
  .min(1)
  .max(2048)
  .custom((value, helpers) => {
    if (!approvedFileRefPattern.test(value) || executableExtensionPattern.test(value)) {
      return helpers.error("string.safeFileRef");
    }
    return value;
  })
  .messages({
    "string.safeFileRef":
      "fileRef must be an approved HTTP or site-relative non-executable file reference",
  });

const metadataText = (maxLength) =>
  Joi.string().trim().max(maxLength).allow("", null);

const allowedExtensions = {
  image: new Set(["avif", "gif", "jpeg", "jpg", "png", "webp"]),
  video: new Set(["m4v", "mov", "mp4", "mpeg", "mpg", "webm"]),
  file: new Set(["pdf"]),
};

export const isMediaReferenceCompatible = (mediaType, fileRef) => {
  const pathWithoutQuery = String(fileRef).split(/[?#]/, 1)[0];
  const extension = pathWithoutQuery.match(/\.([A-Za-z0-9]+)$/)?.[1]?.toLowerCase();
  return !extension || Boolean(allowedExtensions[mediaType]?.has(extension));
};

export const sectionMediaCreateSchema = Joi.object({
  slot: Joi.string().pattern(/^[A-Za-z][A-Za-z0-9_]*$/).max(100).required(),
  mediaType: Joi.string().valid("image", "video", "file").required(),
  fileRef: safeFileReference.required(),
  altEn: metadataText(160),
  altAr: metadataText(160),
  captionEn: metadataText(400),
  captionAr: metadataText(400),
})
  .custom((value, helpers) =>
    isMediaReferenceCompatible(value.mediaType, value.fileRef)
      ? value
      : helpers.error("object.mediaExtension"),
  )
  .messages({
    "object.mediaExtension": "fileRef extension does not match mediaType",
  })
  .unknown(false);

export const sectionMediaUpdateSchema = Joi.object({
  fileRef: safeFileReference,
  altEn: metadataText(160),
  altAr: metadataText(160),
  captionEn: metadataText(400),
  captionAr: metadataText(400),
})
  .or("fileRef", "altEn", "altAr", "captionEn", "captionAr")
  .unknown(false);

export const sectionMediaReorderSchema = Joi.object({
  slot: Joi.string().pattern(/^[A-Za-z][A-Za-z0-9_]*$/).max(100).required(),
  media: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
        position: Joi.number().integer().min(0).required(),
      }).unknown(false),
    )
    .min(1)
    .unique("id")
    .unique("position")
    .required(),
}).unknown(false);

export const sectionMediaParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  mediaId: Joi.number().integer().positive().required(),
}).unknown(false);
