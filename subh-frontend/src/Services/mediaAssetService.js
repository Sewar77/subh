import { api } from "../../api.js";

const toFieldErrors = (errors) => {
  if (!Array.isArray(errors)) return {};
  return errors.reduce((result, error) => {
    const field = error?.field || "_general";
    result[field] = error?.message || String(error);
    return result;
  }, {});
};

export const normalizeMediaAssetError = (error) => {
  if (error?.isMediaAssetError) return error;
  const response = error?.response;
  const normalized = new Error(
    response?.data?.message || error?.message || "The media request failed.",
  );
  normalized.name = "MediaAssetApiError";
  normalized.isMediaAssetError = true;
  normalized.status = response?.status || 0;
  normalized.fieldErrors = toFieldErrors(response?.data?.errors);
  return normalized;
};

const request = async (callback) => {
  try {
    return await callback();
  } catch (error) {
    throw normalizeMediaAssetError(error);
  }
};

export const listMediaAssets = (params = {}, options = {}) =>
  request(async () => {
    const response = await api.get("/admin/media-assets", {
      params,
      signal: options.signal,
    });
    return {
      assets: response.data.assets || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  });

export const getMediaAsset = (id) =>
  request(async () => {
    const response = await api.get(`/admin/media-assets/${id}`);
    return response.data.asset;
  });

export const uploadMediaAsset = (file, metadata = {}) =>
  request(async () => {
    const formData = new FormData();
    formData.append("image", file);
    for (const field of ["displayName", "altTextEn", "altTextAr"]) {
      if (metadata[field] !== undefined && metadata[field] !== "") {
        formData.append(field, metadata[field]);
      }
    }
    const response = await api.post("/admin/media-assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.asset;
  });

export const updateMediaAssetMetadata = (id, metadata) =>
  request(async () => {
    const payload = Object.fromEntries(
      ["displayName", "altTextEn", "altTextAr"]
        .filter((field) => metadata[field] !== undefined)
        .map((field) => [field, metadata[field] || null]),
    );
    const response = await api.patch(`/admin/media-assets/${id}`, payload);
    return response.data.asset;
  });

export const archiveMediaAsset = (id) =>
  request(async () => {
    const response = await api.patch(`/admin/media-assets/${id}/archive`);
    return response.data.asset;
  });

export const restoreMediaAsset = (id) =>
  request(async () => {
    const response = await api.patch(`/admin/media-assets/${id}/restore`);
    return response.data.asset;
  });
