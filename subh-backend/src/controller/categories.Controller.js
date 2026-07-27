import {
  countBooksInCategory,
  createCategory,
  deleteCategory,
  findCategoryByArabicName,
  findCategoryByEnglishName,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../models/categories.Models.js";
import { serializeCategory } from "../utils/categorySerializer.js";

const normalizeCategoryPayload = (body = {}) => {
  const payload = {};
  const { nameEn, nameAr, descriptionEn, descriptionAr, image } = body;

  if (nameEn !== undefined) payload.name_en = String(nameEn).trim();
  if (nameAr !== undefined) payload.name_ar = String(nameAr).trim();
  if (descriptionEn !== undefined)
    payload.description_en = String(descriptionEn).trim();
  if (descriptionAr !== undefined)
    payload.description_ar = String(descriptionAr).trim();
  if (image !== undefined) payload.image = String(image).trim();

  return payload;
};

const isDuplicateCategoryNameError = (error) => error?.code === "23505";

export const createCategoryController = async (req, res) => {
  try {
    const payload = normalizeCategoryPayload(req.body);

    if (!payload.name_en || !payload.name_ar) {
      return res
        .status(400)
        .json({ message: "English and Arabic names are required" });
    }

    const existingByEnglishName = await findCategoryByEnglishName(
      payload.name_en,
    );
    if (existingByEnglishName) {
      return res.status(409).json({ message: "Category name already exists" });
    }

    const existingByArabicName = await findCategoryByArabicName(
      payload.name_ar,
    );
    if (existingByArabicName) {
      return res.status(409).json({ message: "Category name already exists" });
    }

    const category = await createCategory(payload);

    return res.status(201).json({
      category: serializeCategory(category),
    });
  } catch (error) {
    if (isDuplicateCategoryNameError(error)) {
      return res.status(409).json({ message: "Category name already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await listCategories();
    const serializedCategories = categories.map((category) =>
      serializeCategory(category),
    );

    return res.status(200).json({
      categories: serializedCategories,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryByIdController = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const category = await getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      category: serializeCategory(category),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const bookCount = await countBooksInCategory(categoryId);
    if (bookCount > 0) {
      return res
        .status(409)
        .json({ message: "Cannot delete a category that still has books" });
    }

    const deletedCategory = await deleteCategory(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const payload = normalizeCategoryPayload(req.body);
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    if (payload.name_en) {
      const matchingEnglishName = await findCategoryByEnglishName(
        payload.name_en,
      );
      if (matchingEnglishName && matchingEnglishName.id !== categoryId) {
        return res
          .status(409)
          .json({ message: "Category name already exists" });
      }
    }

    if (payload.name_ar) {
      const matchingArabicName = await findCategoryByArabicName(
        payload.name_ar,
      );
      if (matchingArabicName && matchingArabicName.id !== categoryId) {
        return res
          .status(409)
          .json({ message: "Category name already exists" });
      }
    }

    const updatedCategory = await updateCategory(categoryId, payload);
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      category: serializeCategory(updatedCategory),
    });
  } catch (error) {
    if (isDuplicateCategoryNameError(error)) {
      return res.status(409).json({ message: "Category name already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
