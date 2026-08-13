import { useContext } from "react";
import * as categoryService from "../Services/categoryService.js";
import { categoriesContext } from "../Context/categoriesContextValue.js";
export const useCategories = () => {
  const { categories, setCategories, loadCategories, category, setCategory } =
    useContext(categoriesContext);
  const createCategories = async (catData) => {
    const created = await categoryService.createCategory(catData);
    setCategories((previous) => [created, ...previous]);
    return created;
  };
  const updateCategory = async (id, catData) => {
    const updated = await categoryService.updateCategory(id, catData);
    setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
    setCategory(updated);
    return updated;
  };
  const getCategory = async (catId) => {
    const found = await categoryService.getAdminCategory(catId);
    setCategory(found);
    return found;
  };
  const deleteCategoryById = async (catId) => {
    await categoryService.deleteCategory(catId);
    setCategories((previous) => previous.filter((item) => item.id !== catId));
  };
  return {
    createCategories,
    categories,
    loadCategories,
    deleteCategoryById,
    getCategory,
    category,
    updateCategory,
  };
};
