import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguage } from "../../Context/LanguageContext.jsx";
import BookCoverImage from "../../components/Books/BookCoverImage.jsx";
import { getPublicBook } from "../../Services/bookService.js";
import { trackEntityView } from "../../Services/analyticsService.js";

const translations = {
  en: {
    bookDetails: "Book details",

    overview: "Overview",
    descriptionSection: "About this book",
    authorsCategory: "Authors & category",
    pricing: "Pricing & shipping",
    physical: "Physical specifications",
    identifiers: "Book information",

    title: "Title",
    description: "Description",
    category: "Category",
    categoryId: "Category ID",
    authors: "Authors",

    price: "Price",
    shippingCost: "Shipping cost",
    weight: "Weight",

    length: "Length",
    width: "Width",
    height: "Height",

    bookId: "Book ID",
    isbn: "ISBN",
    created: "Added",
    barcode: "Barcode",

    notProvided: "Not provided",
    noCover: "No cover image",
    unavailable: "The selected book is not available.",
    loading: "Loading book details...",

    back: "Back to books",
    categoryButton: "View category",
    requestBooks: "Request books",
  },

  ar: {
    bookDetails: "تفاصيل الكتاب",

    overview: "نظرة عامة",
    descriptionSection: "عن الكتاب",
    authorsCategory: "المؤلفون والتصنيف",
    pricing: "السعر والشحن",
    physical: "المواصفات",
    identifiers: "معلومات الكتاب",

    title: "اسم الكتاب",
    description: "الوصف",
    category: "التصنيف",
    categoryId: "رقم التصنيف",
    authors: "المؤلفون",

    price: "السعر",
    shippingCost: "تكلفة الشحن",
    weight: "الوزن",

    length: "الطول",
    width: "العرض",
    height: "الارتفاع",

    bookId: "رقم الكتاب",
    isbn: "الرقم الدولي ISBN",
    created: "تاريخ الإضافة",
    barcode: "الباركود",

    notProvided: "غير متوفر",
    noCover: "لا توجد صورة للكتاب",
    unavailable: "الكتاب المحدد غير متوفر.",
    loading: "جاري تحميل تفاصيل الكتاب...",

    back: "العودة إلى الكتب",
    categoryButton: "عرض التصنيف",
    requestBooks: "طلب الكتب",
  },
};

export default function BookDetailPage() {
  const { id } = useParams();

  const { language } = useLanguage();

  const isArabic = language === "ar";
  const t = translations[language];

  const requestKey = `${id}:${language}`;
  const [requestState, setRequestState] = useState({
    requestKey: "",
    book: null,
    error: "",
  });

  const formatNumber = (value, options = {}) => {
    if (value == null) return t.notProvided;

    return new Intl.NumberFormat(
      isArabic ? "ar-JO-u-nu-arab" : "en-US",
      options,
    ).format(Number(value));
  };

  const formatDate = (value) => {
    if (!value) return t.notProvided;

    return new Intl.DateTimeFormat(isArabic ? "ar-JO-u-nu-arab" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  };

  const withUnit = (value, englishUnit, arabicUnit) =>
    value != null
      ? `${formatNumber(value)} ${isArabic ? arabicUnit : englishUnit}`
      : t.notProvided;

  useEffect(() => {
    let active = true;

    getPublicBook(id, language)
      .then((item) => {
        if (active) {
          setRequestState({ requestKey, book: item, error: "" });
        }
      })
      .catch((requestError) => {
        if (!active) return;

        setRequestState({
          requestKey,
          book: null,
          error:
            requestError.status === 404 ? t.unavailable : requestError.message,
        });
      });

    return () => {
      active = false;
    };
  }, [id, language, requestKey, t.unavailable]);

  const loading = requestState.requestKey !== requestKey;
  const book = loading ? null : requestState.book;
  const error = loading ? "" : requestState.error;

  useEffect(() => {
    if (book?.id) void trackEntityView("book", book.id, language, `/books/${book.id}`);
  }, [book?.id, language]);

  if (error) {
    return (
      <Container maxWidth="xl" dir={isArabic ? "rtl" : "ltr"} sx={{ py: 6 }}>
        <Stack spacing={3}>
          <Alert severity="error">{error}</Alert>

          <Box>
            <Button
              component={Link}
              to="/books"
              variant="contained"
              startIcon={
                isArabic ? (
                  <ArrowForwardRoundedIcon />
                ) : (
                  <ArrowBackRoundedIcon />
                )
              }
            >
              {t.back}
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  if (loading || !book) {
    return (
      <Box
        dir={isArabic ? "rtl" : "ltr"}
        sx={{
          py: 10,
          textAlign: "center",
        }}
      >
        <CircularProgress />

        <Typography sx={{ mt: 2 }}>{t.loading}</Typography>
      </Box>
    );
  }

  const authors = book.authors || [];

  return (
    <Container
      maxWidth="xl"
      dir={isArabic ? "rtl" : "ltr"}
      sx={{
        py: {
          xs: 1,
          md: 2,
        },
      }}
    >
      {/* Header */}
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <MenuBookRoundedIcon color="secondary" />

            <Typography
              variant="overline"
              color="secondary.main"
              sx={{
                letterSpacing: isArabic ? 0 : ".12em",
                fontWeight: 750,
              }}
            >
              {t.bookDetails}
            </Typography>
          </Stack>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: {
                xs: "2rem",
                sm: "2.7rem",
                md: "2.8rem",
              },

              maxWidth: 850,
              fontWeight: 800,
            }}
          >
            {book.name || t.notProvided}
          </Typography>

          {book.category?.name && (
            <Chip
              label={book.category.name}
              color="primary"
              variant="outlined"
              sx={{ mt: 1.25 }}
            />
          )}
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ "& .MuiButton-root": { minHeight: 40, px: 1.75 } }}>
          <Button
            component={Link}
            to={`/request-books?bookId=${book.id}`}
            variant="contained"
            startIcon={<LibraryAddOutlinedIcon />}
          >
            {t.requestBooks}
          </Button>
          <Button
            component={Link}
            to="/books"
            variant="outlined"
            startIcon={
              isArabic ? <ArrowForwardRoundedIcon /> : <ArrowBackRoundedIcon />
            }
          >
            {t.back}
          </Button>

          {book.category && (
            <Button
              component={Link}
              to={`/categories/${book.category.id}`}
              variant="outlined"
            >
              {t.categoryButton}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Main book presentation */}
      <Paper
        sx={{
          overflow: "hidden",
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(280px, 0.72fr) 1.28fr",
            },
          }}
        >
          {/* Cover */}
          <Box
            sx={{
              minHeight: {
                xs: 320,
                md: 460,
              },

              bgcolor: "#241D38",

              display: "grid",
              placeItems: "center",

              p: {
                xs: 2,
                md: 3,
              },
            }}
          >
            <BookCoverImage
              src={book.coverImage}
              alt={book.name || t.noCover}
              fallback={t.noCover}
              variant="detail"
              loading="eager"
              sx={{
                maxHeight: 420,
                bgcolor: "rgba(255,255,255,.08)",
                boxShadow: book.coverImage
                  ? "0 24px 50px rgba(0,0,0,.30)"
                  : "none",
                "& .MuiTypography-root": { color: "rgba(255,255,255,.7)" },
              }}
            />
          </Box>

          {/* Description */}
          <Stack
            spacing={2.25}
            sx={{
              p: {
                xs: 3,
                md: 4,
              },
            }}
          >
            <SectionTitle>{t.descriptionSection}</SectionTitle>

            <Typography
              color="text.secondary"
              sx={{
                whiteSpace: "pre-line",
                lineHeight: 1.8,
                fontSize: "1rem",
                maxWidth: 760,
              }}
            >
              {book.description || t.notProvided}
            </Typography>

            <Divider />

            <SectionTitle>{t.authorsCategory}</SectionTitle>

            <Detail
              label={t.category}
              value={book.category?.name}
              fallback={t.notProvided}
            />

            <Box>
              <DetailLabel>{t.authors}</DetailLabel>

              {authors.length ? (
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                  {authors.map((author) => (
                    <Chip
                      key={author.id}
                      icon={<PersonOutlineRoundedIcon />}
                      label={author.name || t.notProvided}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ mt: 0.5 }}>{t.notProvided}</Typography>
              )}
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Information grid */}
      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },

          gap: 2,
        }}
      >
        {/* Price */}
        <InfoPaper>
          <SectionTitle icon={<LocalShippingOutlinedIcon />}>
            {t.pricing}
          </SectionTitle>

          <InfoGrid>
            <Detail
              label={t.price}
              value={book.price != null ? formatNumber(book.price) : null}
              fallback={t.notProvided}
            />

            <Detail
              label={t.shippingCost}
              value={
                book.shippingCost != null
                  ? formatNumber(book.shippingCost)
                  : null
              }
              fallback={t.notProvided}
            />

            <Detail
              label={t.weight}
              value={withUnit(book.weightKg, "kg", "كغ")}
              fallback={t.notProvided}
            />
          </InfoGrid>
        </InfoPaper>

        {/* Dimensions */}
        <InfoPaper>
          <SectionTitle icon={<StraightenRoundedIcon />}>
            {t.physical}
          </SectionTitle>

          <InfoGrid>
            <Detail
              label={t.length}
              value={withUnit(book.lengthCm, "cm", "سم")}
              fallback={t.notProvided}
            />

            <Detail
              label={t.width}
              value={withUnit(book.widthCm, "cm", "سم")}
              fallback={t.notProvided}
            />

            <Detail
              label={t.height}
              value={withUnit(book.heightCm, "cm", "سم")}
              fallback={t.notProvided}
            />
          </InfoGrid>
        </InfoPaper>

        {/* Identifiers */}
        <InfoPaper>
          <SectionTitle>{t.identifiers}</SectionTitle>

          <InfoGrid>
            <Detail
              label={t.bookId}
              value={formatNumber(book.id)}
              fallback={t.notProvided}
            />

            <Detail
              label={t.isbn}
              value={
                book.isbn
                  ? isArabic
                    ? book.isbn.replace(
                        /\d/g,
                        (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)],
                      )
                    : book.isbn
                  : null
              }
              fallback={t.notProvided}
            />

            <Detail
              label={t.created}
              value={formatDate(book.createdAt)}
              fallback={t.notProvided}
            />
          </InfoGrid>
          {book.barcodeImage && (
            <>
              <Divider />
              <Box>
                <DetailLabel>{t.barcode}</DetailLabel>
                <Box
                  component="img"
                  src={book.barcodeImage}
                  alt={t.barcode}
                  loading="lazy"
                  decoding="async"
                  sx={{ width: "100%", maxWidth: 260, height: 92, objectFit: "contain", border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1, mt: 0.75, bgcolor: "common.white" }}
                />
              </Box>
            </>
          )}
        </InfoPaper>
      </Box>
    </Container>
  );
}

function DetailLabel({ children }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        fontWeight: 750,
      }}
    >
      {children}
    </Typography>
  );
}

function Detail({ label, value, fallback = "Not provided" }) {
  return (
    <Box>
      <DetailLabel>{label}</DetailLabel>

      <Typography
        sx={{
          mt: 0.45,
          fontWeight: 600,
          overflowWrap: "anywhere",
        }}
      >
        {value ?? fallback}
      </Typography>
    </Box>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {icon && <Box sx={{ color: "secondary.main" }}>{icon}</Box>}

      <Typography
        variant="h5"
        component="h2"
        color="primary.main"
        fontWeight={750}
      >
        {children}
      </Typography>
    </Stack>
  );
}

function InfoGrid({ children }) {
  return (
    <Box
      sx={{
        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        },

        gap: 2.5,
      }}
    >
      {children}
    </Box>
  );
}

function InfoPaper({ children }) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2.25,
          md: 2.75,
        },

        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {children}
    </Paper>
  );
}
