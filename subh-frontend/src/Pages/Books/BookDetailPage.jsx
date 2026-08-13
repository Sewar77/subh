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

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getPublicBook } from "../../Services/bookService.js";

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
  },
};

export default function BookDetailPage() {
  const { id } = useParams();

  const { language } = useLanguage();

  const isArabic = language === "ar";
  const t = translations[language];

  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

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

    setBook(null);
    setError("");

    getPublicBook(id, language)
      .then((item) => {
        if (active) setBook(item);
      })
      .catch((requestError) => {
        if (!active) return;

        setError(
          requestError.status === 404 ? t.unavailable : requestError.message,
        );
      });

    return () => {
      active = false;
    };
  }, [id, language]);

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

  if (!book) {
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
          xs: 4,
          md: 6,
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
          md: "flex-end",
        }}
        spacing={3}
        sx={{ mb: 4 }}
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
                md: "3.4rem",
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
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1}>
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
              variant="contained"
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
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(300px, 0.8fr) 1.2fr",
            },
          }}
        >
          {/* Cover */}
          <Box
            sx={{
              minHeight: {
                xs: 360,
                md: 580,
              },

              bgcolor: "#241D38",

              display: "grid",
              placeItems: "center",

              p: {
                xs: 2,
                md: 4,
              },
            }}
          >
            {book.coverImage ? (
              <Box
                component="img"
                src={book.coverImage}
                alt={book.name || t.noCover}
                loading="lazy"
                sx={{
                  maxWidth: "100%",
                  width: "auto",
                  height: "100%",
                  maxHeight: 520,

                  objectFit: "contain",

                  borderRadius: 2,

                  boxShadow: "0 24px 50px rgba(0,0,0,.30)",
                }}
              />
            ) : (
              <Typography color="rgba(255,255,255,.7)">{t.noCover}</Typography>
            )}
          </Box>

          {/* Description */}
          <Stack
            spacing={3}
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
            }}
          >
            <SectionTitle>{t.descriptionSection}</SectionTitle>

            <Typography
              color="text.secondary"
              sx={{
                whiteSpace: "pre-line",
                lineHeight: 2,
                fontSize: "1.05rem",
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
          },

          gap: 3,
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
        </InfoPaper>

        {/* Barcode */}
        <InfoPaper>
          <SectionTitle>{t.barcode}</SectionTitle>

          {book.barcodeImage ? (
            <Box
              component="img"
              src={book.barcodeImage}
              alt={t.barcode}
              loading="lazy"
              sx={{
                width: "100%",
                maxWidth: 340,
                height: 130,
                objectFit: "contain",

                border: "1px solid",
                borderColor: "divider",

                borderRadius: 2,
                p: 1.5,

                bgcolor: "common.white",
              }}
            />
          ) : (
            <Typography color="text.secondary">{t.notProvided}</Typography>
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
          xs: 2.5,
          md: 3.5,
        },

        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {children}
    </Paper>
  );
}
