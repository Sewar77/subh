const normalizeNumeric = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }

    return Number(trimmed);
  }

  return Number(value);
};

export const serializeBookAuthor = (author) => {
  if (!author) {
    return null;
  }

  return {
    id: author.id,
    nameEn: author.name_en,
    nameAr: author.name_ar,
    authorDescriptionEn: author.author_description_en,
    authorDescriptionAr: author.author_description_ar,
    email: author.email,
    phoneNumber: author.phone_number,
    createdAt: author.created_at,
  };
};

export const serializeBook = (book, options = {}) => {
  if (!book) {
    return null;
  }

  const serialized = {
    id: book.id,
    nameEn: book.name_en,
    nameAr: book.name_ar,
    descriptionEn: book.description_en,
    descriptionAr: book.description_ar,
    weightKg: normalizeNumeric(book.weight_kg),
    barcodeImage: book.barcode_image,
    categoryId: book.category_id,
    price: normalizeNumeric(book.price),
    shippingCost: normalizeNumeric(book.shipping_cost),
    lengthCm: normalizeNumeric(book.length_cm),
    widthCm: normalizeNumeric(book.width_cm),
    heightCm: normalizeNumeric(book.height_cm),
    createdAt: book.created_at,
    coverImage: book.cover_image,
    isbn: book.isbn,
  };

  if (options.category !== undefined) {
    serialized.category = options.category;
  } else if (book.category_join_id) {
    serialized.category = {
      id: book.category_join_id,
      nameEn: book.category_name_en,
      nameAr: book.category_name_ar,
      descriptionEn: book.category_description_en,
      descriptionAr: book.category_description_ar,
      image: book.category_image,
      createdAt: book.category_created_at,
    };
  }

  if (options.authors !== undefined) {
    serialized.authors = options.authors;
  }

  return serialized;
};

export const serializePublicBook = (book, authors = []) => {
  if (!book) return null;
  const publicAuthors = authors.length ? authors : book.authors || [];
  return {
    id: book.id,
    name: book.name,
    description: book.description,
    weightKg: normalizeNumeric(book.weight_kg),
    barcodeImage: book.barcode_image,
    categoryId: book.category_id,
    price: normalizeNumeric(book.price),
    shippingCost: normalizeNumeric(book.shipping_cost),
    lengthCm: normalizeNumeric(book.length_cm),
    widthCm: normalizeNumeric(book.width_cm),
    heightCm: normalizeNumeric(book.height_cm),
    createdAt: book.created_at,
    coverImage: book.cover_image,
    isbn: book.isbn,
    category: book.category_id_join ? { id: book.category_id_join, name: book.category_name, description: book.category_description, image: book.category_image, createdAt: book.category_created_at } : null,
    authors: publicAuthors.map((author) => ({ id: author.id, name: author.name })),
  };
};
