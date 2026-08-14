import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBooksForCategory } from "../../Services/bookService.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import BookCardGrid from "../../components/Books/BookCardGrid.jsx";
import {
  formatCatalogNumber,
  getCatalogCountLabel,
  getCatalogCopy,
} from "../../Utils/catalogI18n.js";
import PublicPageHero from "../../components/Public/PublicPageHero.jsx";

export default function CategoryDetailPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = getCatalogCopy(language);
  const isArabic = language === "ar";
  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const pageKey = `${id}:${language}`;
  const page = pageState.key === pageKey ? pageState.page : 1;
  const requestKey = `${pageKey}:${page}`;
  const [state, setState] = useState({
    requestKey: "",
    categoryKey: "",
    category: null,
    books: [],
    bookCount: 0,
    pagination: null,
    error: "",
  });

  useEffect(() => {
    let active = true;

    getBooksForCategory(id, {
      lang: language,
      page,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    })
      .then((response) => {
        if (!active) return;
        setState({
          requestKey,
          categoryKey: pageKey,
          category: response.category,
          books: response.books,
          bookCount: response.bookCount,
          pagination: response.pagination || null,
          error: "",
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          requestKey,
          categoryKey: pageKey,
          category: null,
          books: [],
          bookCount: 0,
          pagination: null,
          error: requestError.status === 404 ? "not-found" : t.booksLoadError,
        });
      });

    return () => {
      active = false;
    };
  }, [id, language, page, pageKey, requestKey, t.booksLoadError]);

  const loading = state.requestKey !== requestKey;
  const hasCurrentCategory = state.categoryKey === pageKey && state.category;

  const backButton = (
    <Button
      component={Link}
      to="/categories"
      variant="outlined"
      startIcon={isArabic ? <ArrowForwardRoundedIcon /> : <ArrowBackRoundedIcon />}
    >
      {t.backToCategories}
    </Button>
  );

  if (state.error && state.requestKey === requestKey) {
    return (
      <Stack dir={isArabic ? "rtl" : "ltr"} spacing={2}>
        <Alert severity={state.error === "not-found" ? "info" : "error"}>
          {state.error === "not-found" ? t.categoryNotFound : state.error}
        </Alert>
        <Box>{backButton}</Box>
      </Stack>
    );
  }

  if (loading && !hasCurrentCategory) {
    return (
      <Box dir={isArabic ? "rtl" : "ltr"} sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t.loadingCategories}</Typography>
      </Box>
    );
  }

  const name = state.category?.name || t.category;

  return (
    <Stack dir={isArabic ? "rtl" : "ltr"} spacing={{ xs: 3, md: 5 }}>
      <PublicPageHero
        variant="detail"
        eyebrow={t.categoryDetails}
        title={name}
        icon={<CategoryRoundedIcon />}
        count={formatCatalogNumber(state.bookCount, language)}
        countLabel={
          getCatalogCountLabel("categoryBooks", state.bookCount, language)
        }
        actions={backButton}
      />

      <Paper sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(280px, .75fr) 1.25fr" },
          }}
        >
          <Box sx={{ minHeight: { xs: 220, md: 340 }, bgcolor: "action.hover" }}>
            {state.category.image ? (
              <Box
                component="img"
                src={state.category.image}
                alt={name}
                loading="lazy"
                decoding="async"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  minHeight: "inherit",
                  display: "grid",
                  placeItems: "center",
                  color: "text.secondary",
                }}
              >
                {t.noImage}
              </Box>
            )}
          </Box>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h5">{t.description}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap", lineHeight: 1.9 }}>
              {state.category.description || t.noDescription}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box aria-busy={loading}>
        <Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>
          {t.booksInCategory}
        </Typography>
        {loading ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CircularProgress size={32} />
            <Typography sx={{ mt: 1.5 }}>{t.loadingBooks}</Typography>
          </Box>
        ) : state.books.length ? (
          <BookCardGrid books={state.books} />
        ) : (
          <Alert severity="info">{t.noCategoryBooks}</Alert>
        )}

        {state.pagination?.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={state.pagination.totalPages}
              page={page}
              onChange={(_, nextPage) =>
                setPageState({ key: pageKey, page: nextPage })
              }
              getItemAriaLabel={(type, pageNumber) =>
                `${t.pagination}: ${type} ${formatCatalogNumber(pageNumber, language)}`
              }
              aria-label={t.pagination}
            />
          </Box>
        )}
      </Box>
    </Stack>
  );
}
