import { useContext, useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { categoriesContext } from "../Context/categoriesContext";

export const useCategories = () => {
  const { categories, setCategories } = useContext(categoriesContext);
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
      console.log(error);
      toast.error(error);
    }
  };

  return { createCategories, categories };
};
