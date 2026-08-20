import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
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
  formatActiveFilterLabel,
  getCatalogCountLabel,
  getCatalogCopy,
} from "../../Utils/catalogI18n.js";
import BookCardGrid from "./BookCardGrid.jsx";
import PublicPageHero from "../Public/PublicPageHero.jsx";
import { trackEvent } from "../../Services/analyticsService.js";
import {
  CatalogNumberField,
  CatalogSearchField,
  CatalogSelectField,
  CatalogToolbar,
} from "../Catalog/CatalogToolbar.jsx";

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
    minPrice: "",
    maxPrice: "",
    sort: "createdAt:desc",
  });
  const debouncedSearch = useDebouncedValue(filters.search);
  const debouncedMinPrice = useDebouncedValue(filters.minPrice);
  const debouncedMaxPrice = useDebouncedValue(filters.maxPrice);
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
    const query = {
      page,
      limit: 20,
      lang: language,
      search: debouncedSearch,
      minPrice: debouncedMinPrice || null,
      maxPrice: debouncedMaxPrice || null,
      ...selectedSort,
    };
    const request = categoryId
      ? getBooksForCategory(categoryId, query)
      : getPublicBooks({
          ...query,
          categoryId: filters.categoryId || null,
        });

    request
      .then((data) => {
        if (!active) return;
        if (debouncedSearch.trim()) {
          void trackEvent("books_search", {
            locale: language,
            properties: { resultCount: Number(data.pagination?.total ?? data.books.length) },
            dedupeKey: `books-search:${language}:${debouncedSearch.trim().toLocaleLowerCase()}:${page}`,
          });
        }
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
      .catch(() => {
        if (!active) return;
        setState({
          loading: false,
          books: [],
          error: t.booksLoadError,
          category: null,
          bookCount: 0,
          pagination: null,
        });
      });
    return () => {
      active = false;
    };
  }, [
    categoryId,
    debouncedSearch,
    filters.categoryId,
    debouncedMaxPrice,
    debouncedMinPrice,
    language,
    page,
    selectedSort,
    t.booksLoadError,
  ]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt:desc",
    });
    setPage(1);
  };

  const hasFilters =
    Boolean(
      filters.search ||
        filters.categoryId ||
        filters.minPrice ||
        filters.maxPrice,
    ) ||
    filters.sort !== "createdAt:desc";
  const heading = state.category?.name || t.booksTitle;
  const activeFilterCount = [
    filters.search.trim(),
    !categoryId && filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;
  const categoryOptions = [
    { value: "", label: t.allCategories },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ];
  const localizedSortOptions = sortOptions.map((option) => ({
    value: option.value,
    label: t[option.key],
  }));

  if (state.loading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }} dir={isArabic ? "rtl" : "ltr"}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t.loadingBooks}</Typography>
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box sx={{ py: 5 }} dir={isArabic ? "rtl" : "ltr"}>
        <Alert severity="error">{state.error}</Alert>
      </Box>
    );
  }

  return (
    <Box dir={isArabic ? "rtl" : "ltr"}>
      <PublicPageHero
        eyebrow={categoryId ? t.category : t.booksEyebrow}
        title={heading}
        description={
          categoryId
            ? state.category?.description || t.categoryBooksDescription
            : t.booksDescription
        }
        icon={<MenuBookRoundedIcon />}
        count={formatCatalogNumber(state.bookCount, language)}
        countLabel={getCatalogCountLabel("books", state.bookCount, language)}
      />

      <Box sx={{ mt: { xs: 3, md: 4 }, mb: 4 }}>
        <CatalogToolbar
          label={t.catalogFilters}
          activeFilterLabel={
            activeFilterCount
              ? formatActiveFilterLabel(activeFilterCount, language)
              : null
          }
          clearLabel={t.clearFilters}
          clearDisabled={!hasFilters}
          onClear={clearFilters}
          status={`${formatCatalogNumber(state.bookCount, language)} ${getCatalogCountLabel("books", state.bookCount, language)}`}
        >
          <CatalogSearchField
            label={t.searchBooks}
            placeholder={t.searchBooksPlaceholder}
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
          {!categoryId && (
            <CatalogSelectField
              label={t.categoryFilter}
              value={filters.categoryId}
              onChange={(event) =>
                updateFilter("categoryId", event.target.value)
              }
              options={categoryOptions}
            />
          )}
          <CatalogNumberField
            label={t.minPrice}
            value={filters.minPrice}
            onChange={(event) => updateFilter("minPrice", event.target.value)}
          />
          <CatalogNumberField
            label={t.maxPrice}
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value)}
          />
          <CatalogSelectField
            label={t.sort}
            value={filters.sort}
            onChange={(event) => updateFilter("sort", event.target.value)}
            options={localizedSortOptions}
          />
        </CatalogToolbar>
        {!categoryId && categoryError && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            {t.categoriesLoadError}
          </Alert>
        )}
      </Box>

      {state.books.length ? <BookCardGrid books={state.books} /> : <Alert severity="info">{categoryId ? t.noCategoryBooks : t.noBooks}</Alert>}

      {state.pagination?.totalPages > 1 && (
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
    </Box>
  );
}
