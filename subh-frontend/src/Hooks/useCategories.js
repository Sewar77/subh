import { useContext, useEffect, useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { categoriesContext } from "../Context/categoriesContext";
export const useCategories = () => {
  const { categories, setCategories, loadCategories, category, setCategory } =
    useContext(categoriesContext);
  const navigate = useNavigate();
  const createCategories = async (catData) => {
    if (!catData.name_en || !catData.name_ar) {
      toast.error("Name is required feild");
      return;
    }
    const res = await api.post("/categories/create", catData);
    try {
      setCategories(res.data.categories);
      toast.success("created categories ! ");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const updateCategory = async (id, catData) => {
    try {
      const res = await api.put(`/category/update/${id}`, catData);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? res.data.category : cat)),
      );
      toast.success("Category updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const getCategory = async (catId) => {
    try {
      const res = await api.get(`/category/${catId}`);
      setCategory(res.data.category);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const deleteCategoryById = async (catId) => {
    const res = await api.delete(`/category/delete/${catId}`);
    try {
      toast.success("delete categoery!");
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  useEffect(() => {
    loadCategories();
  }, []);
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
