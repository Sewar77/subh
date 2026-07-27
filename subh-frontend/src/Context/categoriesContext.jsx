import { useCallback, useState } from "react";
import { getCategories } from "../Services/categoryService.js";
import { categoriesContext } from "./categoriesContextValue.js";
export default function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({});
  const loadCategories = useCallback(async () => {
    try {
      setCategories(await getCategories());
    } catch (error) {
      setCategories([]);
      throw error;
    }
  }, []);

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
