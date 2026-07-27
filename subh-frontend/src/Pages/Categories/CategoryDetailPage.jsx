import { Alert, Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCategory } from "../../Services/categoryService.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
export default function CategoryDetailPage() {
  const { id } = useParams(); const { language } = useLanguage(); const [category, setCategory] = useState(null); const [error, setError] = useState("");
  useEffect(() => { getCategory(id).then(setCategory).catch((requestError) => setError(requestError.status === 404 ? "not-found" : requestError.message)); }, [id]);
  if (error) return <Container sx={{ py: 5 }}><Alert severity={error === "not-found" ? "info" : "error"}>{error === "not-found" ? (language === "ar" ? "التصنيف غير موجود." : "Category not found.") : error}</Alert><Button component={Link} to="/categories">{language === "ar" ? "العودة للتصنيفات" : "Back to categories"}</Button></Container>;
  if (!category) return <Container sx={{ py: 5 }}><CircularProgress /></Container>;
  const name = language === "ar" ? category.nameAr : category.nameEn; const description = language === "ar" ? category.descriptionAr : category.descriptionEn;
  return <Container maxWidth="md" sx={{ py: 5 }}>{category.image && <Box component="img" src={category.image} alt={name} sx={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 2 }} />}<Typography variant="h3" dir={language === "ar" ? "rtl" : "ltr"} sx={{ mt: 3 }}>{name}</Typography>{description && <Typography dir={language === "ar" ? "rtl" : "ltr"} sx={{ mt: 2 }}>{description}</Typography>}</Container>;
}
