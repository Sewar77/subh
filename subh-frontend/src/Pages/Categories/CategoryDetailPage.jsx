import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBooksForCategory } from "../../Services/bookService.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import BookCardGrid from "../../components/Books/BookCardGrid.jsx";

export default function CategoryDetailPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [state, setState] = useState({ category: null, books: [], bookCount: 0, error: "" });
  useEffect(() => { let active = true; getBooksForCategory(id, language).then((response) => active && setState({ category: response.category, books: response.books, bookCount: response.bookCount, error: "" })).catch((requestError) => active && setState({ category: null, books: [], bookCount: 0, error: requestError.status === 404 ? "not-found" : requestError.message })); return () => { active = false; }; }, [id, language]);
  if (state.error) return <Stack spacing={2}><Alert severity={state.error === "not-found" ? "info" : "error"}>{state.error === "not-found" ? "Category not found." : state.error}</Alert><Box><Button component={Link} to="/categories" variant="contained">Back to categories</Button></Box></Stack>;
  if (!state.category) return <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading category...</Typography></Box>;
  const isArabic = language === "ar";
  const name = state.category.name;
  const description = state.category.description;
  return <Stack spacing={{ xs: 3, md: 5 }}><Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, alignItems: "end" }}><Box><Typography variant="overline" color="secondary.main">CATEGORY</Typography><Typography variant="h2" component="h1" dir={isArabic ? "rtl" : "ltr"}>{name || "Category"}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{state.bookCount} book{state.bookCount === 1 ? "" : "s"} in this category</Typography></Box><Button component={Link} to="/categories" variant="outlined">Back to categories</Button></Box><Paper sx={{ overflow: "hidden" }}><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(260px, .75fr) 1.25fr" } }}>{state.category.image && <Box component="img" src={state.category.image} alt={name || "Category"} loading="lazy" sx={{ width: "100%", minHeight: { xs: 220, md: 320 }, height: "100%", objectFit: "cover" }} />}<Box sx={{ p: { xs: 3, md: 4 } }}><Typography variant="h5">Description</Typography><Typography dir={isArabic ? "rtl" : "ltr"} color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{description || "No description available."}</Typography></Box></Box></Paper><Box><Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>Books</Typography>{state.books.length ? <BookCardGrid books={state.books} /> : <Alert severity="info">No books are available in this category yet.</Alert>}</Box></Stack>;
}
