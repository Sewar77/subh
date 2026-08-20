const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const serializeMediaAsset = (asset) => {
  if (!asset) return null;
  return {
    id: asset.id,
    url: asset.secure_url,
    publicId: asset.cloudinary_public_id,
    displayName: asset.display_name,
    originalFilename: asset.original_filename,
    mimeType: asset.mime_type,
    format: asset.format,
    width: toNumberOrNull(asset.width),
    height: toNumberOrNull(asset.height),
    bytes: toNumberOrNull(asset.bytes),
    altTextEn: asset.alt_text_en,
    altTextAr: asset.alt_text_ar,
    source: asset.source,
    archived: Boolean(asset.archived_at),
    archivedAt: asset.archived_at ?? null,
    uploader: asset.uploader_id
      ? { id: asset.uploader_id, fullName: asset.uploader_name ?? null }
      : null,
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
  };
};

export const serializeMediaAssetList = (assets = []) =>
  assets.map(serializeMediaAsset);
