import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { useEffect, useMemo, useState } from "react";
import { getCategories } from "../../Services/categoryService.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import CategoryCard from "../../components/Categories/CategoryCard.jsx";
import {
  compareCatalogText,
  formatActiveFilterLabel,
  formatCatalogNumber,
  getCatalogCountLabel,
  getCatalogCopy,
} from "../../Utils/catalogI18n.js";
import PublicPageHero from "../../components/Public/PublicPageHero.jsx";
import {
  CatalogSearchField,
  CatalogSelectField,
  CatalogToolbar,
} from "../../components/Catalog/CatalogToolbar.jsx";

export default function CategoriesPage() {
  const { language } = useLanguage();
  const t = getCatalogCopy(language);
  const isArabic = language === "ar";
  const [categories, setCategories] = useState(null);
  const [loadedLanguage, setLoadedLanguage] = useState(null);
  const [error, setError] = useState({ language: null, message: "" });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    let active = true;
    getCategories(language)
      .then((items) => {
        if (!active) return;
        setCategories(items);
        setLoadedLanguage(language);
        setError({ language: null, message: "" });
      })
      .catch(() => {
        if (active) setError({ language, message: t.categoriesLoadError });
      });
    return () => {
      active = false;
    };
  }, [language, t.categoriesLoadError]);

  const visibleCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase(
      isArabic ? "ar" : "en",
    );
    const filtered = (categories || []).filter((category) =>
      `${category.name || ""} ${category.description || ""}`
        .toLocaleLowerCase(isArabic ? "ar" : "en")
        .includes(normalizedSearch),
    );

    return [...filtered].sort((left, right) =>
      sort === "bookCount"
        ? (right.bookCount ?? 0) - (left.bookCount ?? 0) ||
          compareCatalogText(left.name, right.name, language)
        : compareCatalogText(left.name, right.name, language),
    );
  }, [categories, isArabic, language, search, sort]);

  if (error.language === language) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (loadedLanguage !== language || !categories) {
    return (
      <Box dir={isArabic ? "rtl" : "ltr"} sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t.loadingCategories}</Typography>
      </Box>
    );
  }

  const hasFilters = Boolean(search) || sort !== "name";
  const activeFilterCount = search.trim() ? 1 : 0;
  const sortOptions = [
    { value: "name", label: t.name },
    { value: "bookCount", label: t.bookCountSort },
  ];

  return (
    <Stack dir={isArabic ? "rtl" : "ltr"} spacing={{ xs: 3, md: 4 }}>
      <PublicPageHero
        eyebrow={t.categoriesEyebrow}
        title={t.categoriesTitle}
        description={t.categoriesDescription}
        icon={<CategoryRoundedIcon />}
        count={formatCatalogNumber(categories.length, language)}
        countLabel={
          getCatalogCountLabel("categories", categories.length, language)
        }
      />

      <CatalogToolbar
        label={t.catalogFilters}
        activeFilterLabel={
          activeFilterCount
            ? formatActiveFilterLabel(activeFilterCount, language)
            : null
        }
        clearLabel={t.clearFilters}
        clearDisabled={!hasFilters}
        status={`${formatCatalogNumber(visibleCategories.length, language)} ${getCatalogCountLabel("categories", visibleCategories.length, language)}`}
        onClear={() => {
          setSearch("");
          setSort("name");
        }}
      >
        <CatalogSearchField
          label={t.searchCategories}
          placeholder={t.searchCategoriesPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          lgSpan={8}
        />
        <CatalogSelectField
          label={t.sort}
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          options={sortOptions}
          smSpan={12}
          lgSpan={4}
        />
      </CatalogToolbar>

      {visibleCategories.length ? (
        <Box
          aria-live="polite"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: { xs: 2, md: 3 },
          }}
        >
          {visibleCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </Box>
      ) : (
        <Alert severity="info">{t.noCategories}</Alert>
      )}
    </Stack>
  );
}
