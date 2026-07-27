import { api } from "../../api.js";

const toFieldErrors = (errors) => {
  if (!Array.isArray(errors)) return {};

  return errors.reduce((result, error) => {
    if (typeof error === "string") {
      const fieldMatch = error.match(
        /^([A-Za-z][A-Za-z0-9]*)(?:\.(en|ar))?\s+(?:accepts|cannot|is|must)\b/,
      );
      const field = fieldMatch
        ? [fieldMatch[1], fieldMatch[2]].filter(Boolean).join(".")
        : "_general";
      result[field] = [...(result[field] || []), error];
      return result;
    }

    const field = error?.field || "_general";
    result[field] = [...(result[field] || []), error?.message || "Invalid value"];
    return result;
  }, {});
};

export const normalizeCmsError = (error) => {
  if (error?.isCmsError) return error;

  const response = error?.response;
  const firstDetail = Array.isArray(response?.data?.errors)
    ? response.data.errors[0]
    : null;
  const detailMessage =
    typeof firstDetail === "string" ? firstDetail : firstDetail?.message;
  const normalized = new Error(
    response?.data?.message ||
      detailMessage ||
      error?.message ||
      "The CMS request failed",
  );
  normalized.name = "CmsApiError";
  normalized.isCmsError = true;
  normalized.status = response?.status || 0;
  normalized.fieldErrors = toFieldErrors(response?.data?.errors);
  return normalized;
};

const request = async (callback) => {
  try {
    return await callback();
  } catch (error) {
    throw normalizeCmsError(error);
  }
};

const normalizeMedia = (media = {}) => ({
  id: media.id ?? media.media_id,
  sectionId: media.sectionId ?? media.section_id,
  slot: media.slot ?? media.role,
  mediaType: media.mediaType ?? media.media_type ?? "image",
  fileRef: media.fileRef ?? media.url ?? "",
  position: Number(media.position ?? 0),
  altEn: media.altEn ?? media.alt_en ?? "",
  altAr: media.altAr ?? media.alt_ar ?? "",
  captionEn: media.captionEn ?? media.caption_en ?? "",
  captionAr: media.captionAr ?? media.caption_ar ?? "",
  createdAt: media.createdAt ?? media.created_at,
  updatedAt: media.updatedAt ?? media.updated_at,
});

export const normalizeAdminSection = (section = {}) => ({
  id: section.id,
  pageId: section.pageId ?? section.page_id,
  templateKey: section.templateKey ?? section.type,
  position: Number(section.position ?? 0),
  isVisible: section.isVisible ?? section.is_visible ?? true,
  isArchived: section.isArchived ?? section.is_archived ?? false,
  content: section.content || {},
  media: (section.media || []).map(normalizeMedia),
  editingSchema: {
    fields: section.editingSchema?.fields || [],
    mediaSlots: section.editingSchema?.mediaSlots || [],
  },
  createdAt: section.createdAt ?? section.created_at,
  updatedAt: section.updatedAt ?? section.updated_at,
});

const normalizePage = (page = {}, sections = []) => ({
  id: page.id,
  key: page.key,
  name: page.name,
  status: page.status,
  createdAt: page.createdAt ?? page.created_at,
  updatedAt: page.updatedAt ?? page.updated_at,
  sections: sections
    .map(normalizeAdminSection)
    .sort((left, right) => left.position - right.position),
});

export const getFixedPages = () =>
  request(async () => {
    const response = await api.get("/pages");
    return (response.data.pages || []).map((page) => normalizePage(page));
  });

export const getAdminPage = (pageId) =>
  request(async () => {
    const [pageResponse, sectionsResponse] = await Promise.all([
      api.get(`/pages/${pageId}`),
      api.get("/sections"),
    ]);
    const sections = (sectionsResponse.data.sections || []).filter(
      (section) =>
        String(section.pageId ?? section.page_id) === String(pageId),
    );
    return normalizePage(pageResponse.data.page, sections);
  });

export const getAdminSection = (sectionId) =>
  request(async () => {
    const response = await api.get(`/sections/${sectionId}`);
    return normalizeAdminSection(response.data.section);
  });

export const updateSectionContent = (sectionId, content) =>
  request(async () => {
    const response = await api.patch(`/sections/${sectionId}/content`, {
      content,
    });
    return normalizeAdminSection(response.data.section);
  });

export const updateSectionVisibility = (sectionId, isVisible) =>
  request(async () => {
    const response = await api.patch(`/sections/${sectionId}/visibility`, {
      isVisible,
    });
    return normalizeAdminSection(response.data.section);
  });

export const archiveSection = (sectionId) =>
  request(async () => {
    const response = await api.patch(`/sections/${sectionId}/archive`);
    return normalizeAdminSection(response.data.section);
  });

export const restoreSection = (sectionId) =>
  request(async () => {
    const response = await api.patch(`/sections/${sectionId}/restore`);
    return normalizeAdminSection(response.data.section);
  });

export const reorderPageSections = (pageId, sections) =>
  request(async () => {
    const response = await api.patch(`/pages/${pageId}/sections/reorder`, {
      sections: sections.map(({ id, position }) => ({ id, position })),
    });
    return (response.data.sections || []).map(normalizeAdminSection);
  });

export const addSectionMedia = (sectionId, media) =>
  request(async () => {
    const response = await api.post(`/sections/${sectionId}/media`, media);
    return normalizeMedia(response.data.media);
  });

export const replaceSectionMedia = (sectionId, mediaId, fileRef) =>
  request(async () => {
    const response = await api.patch(
      `/sections/${sectionId}/media/${mediaId}`,
      { fileRef },
    );
    return normalizeMedia(response.data.media);
  });

export const updateSectionMedia = (sectionId, mediaId, metadata) =>
  request(async () => {
    const response = await api.patch(
      `/sections/${sectionId}/media/${mediaId}`,
      metadata,
    );
    return normalizeMedia(response.data.media);
  });

export const deleteSectionMedia = (sectionId, mediaId) =>
  request(() => api.delete(`/sections/${sectionId}/media/${mediaId}`));

export const reorderSectionMedia = (sectionId, slot, media) =>
  request(async () => {
    const response = await api.patch(`/sections/${sectionId}/media/reorder`, {
      slot,
      media: media.map(({ id, position }) => ({ id, position })),
    });
    return (response.data.media || []).map(normalizeMedia);
  });

export const uploadCmsFile = (file) =>
  request(async () => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  });
