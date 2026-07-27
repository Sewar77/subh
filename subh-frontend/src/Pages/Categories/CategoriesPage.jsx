import { Alert, Box, Card, CardActionArea, CardContent, CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../Services/categoryService.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
export default function CategoriesPage() {
  const { language } = useLanguage(); const [categories, setCategories] = useState(null); const [error, setError] = useState("");
  useEffect(() => { getCategories().then(setCategories).catch((requestError) => setError(requestError.message)); }, []);
  if (error) return <Container sx={{ py: 5 }}><Alert severity="error">{error}</Alert></Container>;
  if (!categories) return <Container sx={{ py: 5 }}><CircularProgress /></Container>;
  if (!categories.length) return <Container sx={{ py: 5 }}><Typography>{language === "ar" ? "لا توجد تصنيفات حالياً." : "No categories are available yet."}</Typography></Container>;
  return <Container sx={{ py: 5 }}><Typography variant="h3" sx={{ mb: 3 }}>{language === "ar" ? "التصنيفات" : "Categories"}</Typography><Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>{categories.map((category) => <Card key={category.id}><CardActionArea component={Link} to={`/categories/${category.id}`}>{category.image ? <Box component="img" src={category.image} alt={language === "ar" ? category.nameAr : category.nameEn} sx={{ width: "100%", height: 160, objectFit: "cover" }} /> : <Box sx={{ height: 160, display: "grid", placeItems: "center", bgcolor: "action.hover" }}><Typography>{language === "ar" ? "لا توجد صورة" : "No image"}</Typography></Box>}<CardContent><Typography variant="h6" dir={language === "ar" ? "rtl" : "ltr"}>{language === "ar" ? category.nameAr : category.nameEn}</Typography><Typography dir={language === "ar" ? "rtl" : "ltr"}>{language === "ar" ? category.descriptionAr : category.descriptionEn}</Typography></CardContent></CardActionArea></Card>)}</Box></Container>;
}
