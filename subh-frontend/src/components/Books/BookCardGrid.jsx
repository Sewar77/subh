import { Box, Button, Card, CardActions, CardContent, Chip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";

const fallback = (value, message = "Not provided") => value || message;

export default function BookCardGrid({ books }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  return <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 255px), 1fr))", gap: { xs: 2, md: 3 } }}>{books.map((book) => {
    const title = isArabic ? book.nameAr : book.nameEn;
    const description = isArabic ? book.descriptionAr : book.descriptionEn;
    const category = isArabic ? book.category?.nameAr : book.category?.nameEn;
    const authors = book.authors?.map((author) => isArabic ? author.nameAr : author.nameEn).filter(Boolean).join(", ");
    return <Card key={book.id} sx={{ display: "flex", flexDirection: "column", overflow: "hidden", transition: "transform .2s ease, box-shadow .2s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 34px rgba(7, 26, 53, .16)" }, "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } } }}>{book.coverImage ? <Box component="img" src={book.coverImage} alt={fallback(title, "Book cover")} loading="lazy" sx={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", bgcolor: "action.hover" }} /> : <Box sx={{ aspectRatio: "4 / 3", display: "grid", placeItems: "center", bgcolor: "action.hover", color: "text.secondary" }}><Typography>No cover image</Typography></Box>}<CardContent sx={{ flexGrow: 1, p: 2.5 }}><Typography variant="h6" component="h2" dir={isArabic ? "rtl" : "ltr"} sx={{ minHeight: "3.2em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{fallback(title)}</Typography>{category && <Chip size="small" label={category} sx={{ mt: 1, bgcolor: "rgba(36,190,200,.13)", color: "primary.main" }} />}{authors && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{authors}</Typography>}<Typography dir={isArabic ? "rtl" : "ltr"} color="text.secondary" sx={{ mt: 1.25, minHeight: "4.5em", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{fallback(description, "No description available.")}</Typography><Typography variant="subtitle2" sx={{ mt: 2, color: "primary.main" }}>{book.price != null ? `Price: ${book.price}` : "Price on request"}</Typography></CardContent><CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}><Button component={Link} to={`/books/${book.id}`} variant="contained" fullWidth>View book</Button></CardActions></Card>;
  })}</Box>;
}
