import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getCategories } from "../../Services/categoryService.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import CategoryCard from "../../components/Categories/CategoryCard.jsx";

export default function CategoriesPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState(null);
  const [loadedLanguage, setLoadedLanguage] = useState(null);
  const [error, setError] = useState({ language: null, message: "" });

  useEffect(() => {
    let active = true;
    getCategories(language)
      .then((items) => {
        if (!active) return;
        setCategories(items);
        setLoadedLanguage(language);
        setError({ language: null, message: "" });
      })
      .catch((requestError) => {
        if (active) setError({ language, message: requestError.message });
      });
    return () => {
      active = false;
    };
  }, [language]);

  if (error.language === language) return <Alert severity="error">{error.message}</Alert>;
  if (loadedLanguage !== language || !categories) return <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading categories...</Typography></Box>;
  return <Box><Box sx={{ maxWidth: 720, mb: { xs: 3, md: 5 } }}><Typography variant="overline" color="secondary.main">EXPLORE SUBH</Typography><Typography variant="h2" component="h1" dir={language === "ar" ? "rtl" : "ltr"}>{language === "ar" ? "التصنيفات" : "Browse categories"}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{language === "ar" ? "اكتشف الكتب المنظمة حسب الموضوع والاهتمام." : "Discover books organised by subject and interest."}</Typography></Box>{categories.length ? <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: { xs: 2, md: 3 } }}>{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</Box> : <Alert severity="info">No categories are available yet.</Alert>}</Box>;
}
