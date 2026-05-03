import {
  createCategory,
  getAllCategories,
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
