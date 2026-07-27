export const serializeSectionInstance = (section = {}) => {
  const templateKey = section.template_key || section.type;
  const pageId = section.page_id ?? section.pageId;
  const isVisible = section.is_visible ?? section.isVisible ?? true;
  const isArchived = section.is_archived ?? section.isArchived ?? false;

  return {
    id: section.id,
    page_id: pageId,
    type: templateKey,
    position: section.position,
    is_visible: isVisible,
    is_archived: isArchived,
    created_at: section.created_at,
    updated_at: section.updated_at,
    page_key: section.page_key,
    page_name: section.page_name,
    page_status: section.page_status,
    pageId,
    templateKey,
    isVisible,
    isArchived,
    createdAt: section.created_at,
    updatedAt: section.updated_at,
  };
};

export const serializePublicSection = (
  section,
  content,
  media,
  translations,
) => ({
  ...serializeSectionInstance(section),
  content,
  media,
  translations,
});

export const serializeAdminSection = (
  section,
  content,
  media,
  translations,
  editingSchema,
) => ({
  ...serializeSectionInstance(section),
  content,
  media,
  translations,
  editingSchema,
});
