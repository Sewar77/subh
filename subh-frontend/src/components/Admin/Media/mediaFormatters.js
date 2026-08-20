export const formatBytes = (bytes) => {
  if (!Number.isFinite(Number(bytes))) return "Not available";
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
};

export const assetName = (asset) =>
  asset.displayName || asset.originalFilename || `Media asset ${asset.id}`;

export const assetDimensions = (asset) =>
  asset.width && asset.height
    ? `${asset.width} × ${asset.height} px`
    : "Not available";

