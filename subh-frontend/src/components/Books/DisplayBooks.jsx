import { Alert, CircularProgress, Container, Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getBooksForCategory, getPublicBooks } from "../../Services/bookService.js";
import BookCardGrid from "./BookCardGrid.jsx";

export default function DisplayBooks() {
  const { language } = useLanguage();
  const { id: categoryId } = useParams();
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, books: [], error: "", category: null, bookCount: 0 });
  useEffect(() => {
    let active = true;
    const request = categoryId ? getBooksForCategory(categoryId) : getPublicBooks({ page, limit: 20 });
    request.then((data) => active && setState({ loading: false, books: data.books, error: "", category: data.category || null, bookCount: data.bookCount ?? data.pagination?.total ?? data.books.length, pagination: data.pagination || null })).catch((error) => active && setState({ loading: false, books: [], error: error.message, category: null, bookCount: 0, pagination: null }));
    return () => { active = false; };
  }, [categoryId, page]);
  if (state.loading) return <Container sx={{ py: 6, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading books...</Typography></Container>;
  if (state.error) return <Container sx={{ py: 4 }}><Alert severity="error">{state.error}</Alert></Container>;
  const heading = state.category ? (language === "ar" ? state.category.nameAr : state.category.nameEn) : "Books";
  return <Container sx={{ py: 4 }}><Typography variant="h3" sx={{ mb: 1 }}>{heading}</Typography><Typography sx={{ mb: 3 }}>{state.bookCount} book{state.bookCount === 1 ? "" : "s"}</Typography>{state.books.length ? <BookCardGrid books={state.books} /> : <Alert severity="info">No books are available in this category yet.</Alert>}{!categoryId && state.pagination?.totalPages > 1 && <Pagination count={state.pagination.totalPages} page={page} onChange={(_, nextPage) => setPage(nextPage)} sx={{ mt: 3 }} aria-label="Books pagination" />}</Container>;
}
