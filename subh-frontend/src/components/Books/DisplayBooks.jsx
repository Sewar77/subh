import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import useDebouncedValue from "../../Hooks/useDebouncedValue.js";
import {
  getBooksForCategory,
  getPublicBooks,
} from "../../Services/bookService.js";
import { getCategories } from "../../Services/categoryService.js";
import {
  formatCatalogNumber,
  getCatalogCopy,
} from "../../Utils/catalogI18n.js";
import BookCardGrid from "./BookCardGrid.jsx";

const sortOptions = [
  { value: "createdAt:desc", key: "newest" },
  { value: "price:asc", key: "priceLow" },
  { value: "price:desc", key: "priceHigh" },
  { value: "name:asc", key: "name" },
];

export default function DisplayBooks() {
  const { language } = useLanguage();
  const { id: categoryId } = useParams();
  const t = getCatalogCopy(language);
  const isArabic = language === "ar";
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    sort: "createdAt:desc",
  });
  const debouncedSearch = useDebouncedValue(filters.search);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [state, setState] = useState({
    loading: true,
    books: [],
    error: "",
    category: null,
    bookCount: 0,
    pagination: null,
  });

  const selectedSort = useMemo(() => {
    const [sortBy, sortOrder] = filters.sort.split(":");
    return { sortBy, sortOrder };
  }, [filters.sort]);

  useEffect(() => {
    if (categoryId) return undefined;
    let active = true;
    getCategories(language)
      .then((items) => active && setCategories(items))
      .catch((error) => active && setCategoryError(error.message));
    return () => {
      active = false;
    };
  }, [categoryId, language]);

  useEffect(() => {
    let active = true;
    const request = categoryId
      ? getBooksForCategory(categoryId, language)
      : getPublicBooks({
          page,
          limit: 20,
          lang: language,
          search: debouncedSearch,
          categoryId: filters.categoryId || null,
          ...selectedSort,
        });

    request
      .then((data) => {
        if (!active) return;
        setState({
          loading: false,
          books: data.books,
          error: "",
          category: data.category || null,
          bookCount:
            data.bookCount ?? data.pagination?.total ?? data.books.length,
          pagination: data.pagination || null,
        });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          loading: false,
          books: [],
          error: error.message,
          category: null,
          bookCount: 0,
          pagination: null,
        });
      });
    return () => {
      active = false;
    };
  }, [categoryId, debouncedSearch, filters.categoryId, language, page, selectedSort]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", categoryId: "", sort: "createdAt:desc" });
    setPage(1);
  };

  const hasFilters =
    Boolean(filters.search || filters.categoryId) ||
    filters.sort !== "createdAt:desc";
  const heading = state.category?.name || t.booksTitle;

  if (state.loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }} dir={isArabic ? "rtl" : "ltr"}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t.loadingBooks}</Typography>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container sx={{ py: 5 }} dir={isArabic ? "rtl" : "ltr"}>
        <Alert severity="error">{state.error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" dir={isArabic ? "rtl" : "ltr"} sx={{ py: { xs: 3, md: 6 } }}>
      <Box
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          mb: 4,
          borderRadius: 4,
          color: "common.white",
          background: "linear-gradient(120deg, #102943, #613389 58%, #bb40bf)",
        }}
      >
        <Typography variant="overline" sx={{ color: "#41f2c3", fontWeight: 700 }}>
          {categoryId ? t.category : t.booksEyebrow}
        </Typography>
        <Typography variant="h1" component="h1" sx={{ mt: 0.5, fontSize: { xs: "2rem", md: "3.1rem" }, maxWidth: 800 }}>
          {heading}
        </Typography>
        {!categoryId && <Typography sx={{ mt: 1.5, maxWidth: 680, color: "rgba(255,255,255,.84)" }}>{t.booksDescription}</Typography>}
        <Typography sx={{ mt: 2.5, fontWeight: 700 }}>
          {formatCatalogNumber(state.bookCount, language)} {t.bookCount}
        </Typography>
      </Box>

      {!categoryId && (
        <Box component="form" onSubmit={(event) => event.preventDefault()} sx={{ mb: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField
              label={t.searchBooks}
              placeholder={t.searchBooksPlaceholder}
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} /> } }}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <FormControl sx={{ minWidth: { xs: "100%", sm: 210 } }}>
              <InputLabel id="book-category-filter-label">{t.categoryFilter}</InputLabel>
              <Select labelId="book-category-filter-label" label={t.categoryFilter} value={filters.categoryId} onChange={(event) => updateFilter("categoryId", event.target.value)}>
                <MenuItem value="">{t.allCategories}</MenuItem>
                {categories.map((category) => <MenuItem key={category.id} value={String(category.id)}>{category.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 210 } }}>
              <InputLabel id="book-sort-label">{t.sort}</InputLabel>
              <Select labelId="book-sort-label" label={t.sort} value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
                {sortOptions.map((option) => <MenuItem key={option.value} value={option.value}>{t[option.key]}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={clearFilters} disabled={!hasFilters} sx={{ minHeight: 48, whiteSpace: "nowrap" }}>
              {t.clearFilters}
            </Button>
          </Stack>
          {categoryError && <Alert severity="warning" sx={{ mt: 1.5 }}>{categoryError}</Alert>}
        </Box>
      )}

      {state.books.length ? <BookCardGrid books={state.books} /> : <Alert severity="info">{categoryId ? t.noCategoryBooks : t.noBooks}</Alert>}

      {!categoryId && state.pagination?.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={state.pagination.totalPages}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
            getItemAriaLabel={(type, pageNumber) => `${t.pagination}: ${type} ${formatCatalogNumber(pageNumber, language)}`}
            aria-label={t.pagination}
          />
        </Box>
      )}
    </Container>
  );
}
