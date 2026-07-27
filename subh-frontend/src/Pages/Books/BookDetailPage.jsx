import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getPublicBook } from "../../Services/bookService.js";

const notProvided = (value, fallback = "Not provided") => value ?? fallback;
const Detail = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: ".06em" }}
    >
      {label}
    </Typography>
    <Typography sx={{ mt: 0.25, overflowWrap: "anywhere" }}>
      {notProvided(value)}
    </Typography>
  </Box>
);
const SectionTitle = ({ children }) => (
  <Typography variant="h5" component="h2" color="primary.main" sx={{ pt: 1 }}>
    {children}
  </Typography>
);

export default function BookDetailPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getPublicBook(id)
      .then((item) => active && setBook(item))
      .catch(
        (requestError) =>
          active &&
          setError(
            requestError.status === 404
              ? "The selected book is not available."
              : requestError.message,
          ),
      );
    return () => {
      active = false;
    };
  }, [id]);
  if (error)
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Box>
          <Button component={Link} to="/books" variant="contained">
            Back to books
          </Button>
        </Box>
      </Stack>
    );
  if (!book)
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading book details...</Typography>
      </Box>
    );
  const isArabic = language === "ar";
  const title = isArabic ? book.nameAr : book.nameEn;
  const authors = book.authors || [];
  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="overline" color="secondary.main">
            BOOK DETAILS
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {notProvided(title)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button component={Link} to="/books" variant="outlined">
            Back to books
          </Button>
          {book.category && (
            <Button
              component={Link}
              to={`/categories/${book.category.id}`}
              variant="contained"
            >
              View category
            </Button>
          )}
        </Box>
      </Box>
      <Paper sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(280px, .85fr) 1.15fr",
            },
          }}
        >
          <Box
            sx={{
              bgcolor: "#071a35",
              display: "grid",
              placeItems: "center",
              minHeight: { xs: 280, md: 460 },
            }}
          >
            {book.coverImage ? (
              <Box
                component="img"
                src={book.coverImage}
                alt={notProvided(title, "Book cover")}
                loading="lazy"
                sx={{
                  width: "100%",
                  height: "100%",
                  maxHeight: { xs: 420, md: 560 },
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography color="rgba(255,255,255,.72)">
                No cover image
              </Typography>
            )}
          </Box>
          <Stack spacing={2.5} sx={{ p: { xs: 3, md: 4.5 } }}>
            <SectionTitle>Overview</SectionTitle>
            <Detail label="English title" value={book.nameEn} />
            <Detail label="Arabic title" value={book.nameAr} />
            <Divider />
            <SectionTitle>Description</SectionTitle>
            <Detail label="English description" value={book.descriptionEn} />
            <Detail label="Arabic description" value={book.descriptionAr} />
          </Stack>
        </Box>
      </Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
        }}
      >
        <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <SectionTitle>Authors and category</SectionTitle>
            <Detail
              label="Category"
              value={
                book.category
                  ? `${book.category.nameEn || ""}${book.category.nameAr ? ` / ${book.category.nameAr}` : ""}`
                  : null
              }
            />
            <Detail label="Category ID" value={book.categoryId} />
            {authors.length ? (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: ".06em" }}
                >
                  Authors
                </Typography>
                <Stack component="ul" spacing={0.5} sx={{ pl: 2.5, my: 0.5 }}>
                  {authors.map((author) => (
                    <Typography component="li" key={author.id}>
                      {[author.nameEn, author.nameAr]
                        .filter(Boolean)
                        .join(" / ") || "Not provided"}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : (
              <Detail label="Authors" value={null} />
            )}
          </Stack>
        </Paper>
        <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <SectionTitle>Pricing</SectionTitle>
            <Detail
              label="Price"
              value={book.price != null ? book.price : null}
            />
            <Detail
              label="Shipping cost"
              value={book.shippingCost != null ? book.shippingCost : null}
            />
            <Detail
              label="Weight"
              value={book.weightKg != null ? `${book.weightKg} kg` : null}
            />
          </Stack>
        </Paper>
        <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <SectionTitle>Physical specifications</SectionTitle>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 2,
              }}
            >
              <Detail
                label="Length"
                value={book.lengthCm != null ? `${book.lengthCm} cm` : null}
              />
              <Detail
                label="Width"
                value={book.widthCm != null ? `${book.widthCm} cm` : null}
              />
              <Detail
                label="Height"
                value={book.heightCm != null ? `${book.heightCm} cm` : null}
              />
            </Box>
          </Stack>
        </Paper>
        <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <SectionTitle>Publication and identifiers</SectionTitle>
            <Detail label="Book ID" value={book.id} />
            <Detail label="ISBN" value={book.isbn} />
            <Detail
              label="Created"
              value={
                book.createdAt
                  ? new Date(book.createdAt).toLocaleDateString()
                  : null
              }
            />
            {book.barcodeImage ? (
              <Box
                component="img"
                src={book.barcodeImage}
                alt="Book barcode"
                loading="lazy"
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  height: 100,
                  objectFit: "contain",
                  objectPosition: "left",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                }}
              />
            ) : (
              <Detail label="Barcode image" value={null} />
            )}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}
