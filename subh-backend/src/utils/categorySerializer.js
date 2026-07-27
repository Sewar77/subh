export const serializeCategory = (category) => {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    nameEn: category.name_en,
    nameAr: category.name_ar,
    descriptionEn: category.description_en,
    descriptionAr: category.description_ar,
    image: category.image,
    createdAt: category.created_at,
    ...(category.updated_at ? { updatedAt: category.updated_at } : {}),
  };
};
