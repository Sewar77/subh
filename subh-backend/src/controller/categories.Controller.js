import {
  createCategory,
  deleteCategory,
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
    const fields = [];
    const values = [];
    let index = 1;

    if (name_en !== undefined) {
      fields.push(`name_en = $${index++}`);
      values.push(name_en);
    }

    if (name_ar !== undefined) {
      fields.push(`name_ar = $${index++}`);
      values.push(name_ar);
    }

    if (description_en !== undefined) {
      fields.push(`description_en = $${index++}`);
      values.push(description_en);
    }

    if (description_ar !== undefined) {
      fields.push(`description_ar = $${index++}`);
      values.push(description_ar);
    }

    if (image !== undefined) {
      fields.push(`image = $${index++}`);
      values.push(image);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    const query = `
      UPDATE categories
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(catId);

    const result = await pool.query(query, values);

    return res.status(200).json({
      message: "Category updated",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
