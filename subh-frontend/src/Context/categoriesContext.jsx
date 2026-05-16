import { useState } from "react";
import { createContext } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
export const categoriesContext = createContext();
export default function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({});
  const loadCategories = async () => {
    try {
      const res = await api.get("/categories/all");
      setCategories(res.data.categories);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <categoriesContext.Provider
      value={{
        categories,
        setCategories,
        loadCategories,
        category,
        setCategory,
      }}
    >
      {children}
    </categoriesContext.Provider>
  );
}
