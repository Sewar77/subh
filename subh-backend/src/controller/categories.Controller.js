import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../models/categories.Models.js";

export const createCategoryController = async (req, res) => {
  const { name_en, name_ar, description_en, description_ar, image } = req.body;
  try {
    console.log(req.body);
    if (!name_en || !name_ar) {
      return res.status(400).json({
        message: "English and Arabic names are required",
      });
    }
    const category = await createCategory({
      name_en,
      name_ar,
      description_en,
      description_ar,
      image,
    });
    return res.status(201).json({
      message: "created category",
      category,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await getAllCategories();

    return res.status(200).json({
      message: categories.length ? "categories fetched" : "No categories yet",
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCategoryByIdController = async (req, res) => {
  const catId = req.params.id;
  console.log("catId", catId);

  try {
    const category = await getCategoryById(catId);
    console.log("category", category);

    if (!category) {
      return res.status(400).json({
        message: "Category not found",
      });
    }
    return res.status(200).json({
      message: "category gets",
      category: category,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  const catId = req.params.id;

  try {
    const deletedCat = await deleteCategory(catId);

    if (!deletedCat) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Deleted successfully",
      data: deletedCat,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateCategoryController = async (req, res) => {
  const catId = req.params.id;
  const { name_en, name_ar, description_en, description_ar, image } = req.body;
  try {
    const updated = await updateCategory(catId, {
      name_en,
      name_ar,
      description_en,
      description_ar,
      image,
    });
    return res.status(200).json({
      message: "Category updated",
      category: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
