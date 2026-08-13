export const serializePage = (page = {}) => ({
  id: page.id,
  key: page.key,
  slug: page.slug || page.key,
  nameEn: page.name_en || page.name || null,
  nameAr: page.name_ar || page.name || null,
  isActive: page.is_active ?? page.status === "published",
  createdAt: page.created_at,
  updatedAt: page.updated_at,
});

export const serializePublicPage = (page = {}, sections = []) => ({
  page: {
    id: page.id,
    key: page.key,
    slug: page.slug || page.key,
    name: page.name || null,
    sections,
  },
});

export const serializeAdminPage = (page = {}, sections = []) => ({
  page: {
    ...serializePage(page),
    sections,
  },
});
