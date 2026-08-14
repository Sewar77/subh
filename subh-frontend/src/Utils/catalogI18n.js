const catalogCopy = {
  en: {
    booksEyebrow: "Subh library",
    booksTitle: "Explore our educational resources",
    booksDescription: "Browse the growing Subh collection by title, author, category, and price.",
    categoriesEyebrow: "Explore Subh",
    categoriesTitle: "Discover resources by category",
    categoriesDescription: "Browse subjects and interests to find the right educational resources.",
    categoryBooksDescription: "Explore the books available in this category.",
    catalogFilters: "Search and filters",
    activeFilters: "active filters",
    activeFilter: "active filter",
    searchBooks: "Search books",
    searchCategories: "Search categories",
    searchBooksPlaceholder: "Search by title, author, or category",
    searchCategoriesPlaceholder: "Search by category name or description",
    categoryFilter: "Category",
    allCategories: "All categories",
    minPrice: "Minimum price",
    maxPrice: "Maximum price",
    sort: "Sort by",
    newest: "Newest first",
    priceLow: "Price: low to high",
    priceHigh: "Price: high to low",
    name: "Name A–Z",
    bookCountSort: "Most books first",
    bookCount: "books",
    categoryCount: "categories",
    categoryBooksCount: "books in this category",
    clearFilters: "Clear filters",
    loadingBooks: "Loading books…",
    loadingCategories: "Loading categories…",
    booksLoadError: "Books could not be loaded. Please try again.",
    categoriesLoadError: "Categories could not be loaded. Please try again.",
    noBooks: "No books match these filters.",
    noCategoryBooks: "No books are available in this category yet.",
    noCategories: "No categories match these filters.",
    noDescription: "No description available.",
    noCover: "No cover image",
    noImage: "No category image",
    notProvided: "Not provided",
    price: "Price",
    priceOnRequest: "Price on request",
    viewBook: "View book",
    viewBooks: "View books",
    details: "Details",
    category: "Category",
    categoryDetails: "Category details",
    booksInCategory: "Books in this category",
    description: "Description",
    books: "Books",
    backToCategories: "Back to categories",
    categoryNotFound: "Category not found.",
    pagination: "Books pagination",
  },
  ar: {
    booksEyebrow: "مكتبة صبح",
    booksTitle: "استكشف مواردنا التعليمية",
    booksDescription: "تصفح مجموعة صبح حسب العنوان والمؤلف والتصنيف والسعر.",
    categoriesEyebrow: "استكشف صبح",
    categoriesTitle: "اكتشف الموارد حسب التصنيف",
    categoriesDescription: "تصفح الموضوعات والاهتمامات للوصول إلى الموارد التعليمية المناسبة.",
    categoryBooksDescription: "استكشف الكتب المتاحة ضمن هذا التصنيف.",
    catalogFilters: "البحث والتصفية",
    activeFilters: "عوامل تصفية مفعّلة",
    activeFilter: "عامل تصفية مفعّل",
    searchBooks: "البحث في الكتب",
    searchCategories: "البحث في التصنيفات",
    searchBooksPlaceholder: "ابحث بالعنوان أو المؤلف أو التصنيف",
    searchCategoriesPlaceholder: "ابحث باسم التصنيف أو وصفه",
    categoryFilter: "التصنيف",
    allCategories: "كل التصنيفات",
    minPrice: "السعر الأدنى",
    maxPrice: "السعر الأقصى",
    sort: "الترتيب",
    newest: "الأحدث أولاً",
    priceLow: "السعر: من الأقل إلى الأعلى",
    priceHigh: "السعر: من الأعلى إلى الأقل",
    name: "الاسم",
    bookCountSort: "الأكثر كتباً أولاً",
    bookCount: "كتاب",
    categoryCount: "تصنيفات",
    categoryBooksCount: "كتاب في هذا التصنيف",
    clearFilters: "مسح عوامل التصفية",
    loadingBooks: "جارٍ تحميل الكتب…",
    loadingCategories: "جارٍ تحميل التصنيفات…",
    booksLoadError: "تعذر تحميل الكتب. يرجى المحاولة مرة أخرى.",
    categoriesLoadError: "تعذر تحميل التصنيفات. يرجى المحاولة مرة أخرى.",
    noBooks: "لا توجد كتب مطابقة لعوامل التصفية.",
    noCategoryBooks: "لا توجد كتب متاحة في هذا التصنيف بعد.",
    noCategories: "لا توجد تصنيفات مطابقة لعوامل التصفية.",
    noDescription: "لا يوجد وصف متاح.",
    noCover: "لا توجد صورة للكتاب",
    noImage: "لا توجد صورة للتصنيف",
    notProvided: "غير متوفر",
    price: "السعر",
    priceOnRequest: "السعر عند الطلب",
    viewBook: "عرض الكتاب",
    viewBooks: "عرض الكتب",
    details: "التفاصيل",
    category: "التصنيف",
    categoryDetails: "تفاصيل التصنيف",
    booksInCategory: "كتب هذا التصنيف",
    description: "الوصف",
    books: "الكتب",
    backToCategories: "العودة إلى التصنيفات",
    categoryNotFound: "التصنيف غير موجود.",
    pagination: "ترقيم صفحات الكتب",
  },
};

export const getCatalogCopy = (language) => catalogCopy[language] || catalogCopy.en;

const localeFor = (language) =>
  language === "ar" ? "ar-JO-u-nu-arab" : "en-US";

export const formatCatalogNumber = (value, language) =>
  new Intl.NumberFormat(localeFor(language)).format(Number(value || 0));

export const formatCatalogPrice = (value, language) =>
  value == null ? null : formatCatalogNumber(value, language);

export const getCatalogCountLabel = (kind, value, language) => {
  const count = Number(value || 0);
  if (language !== "ar") {
    const labels = {
      books: count === 1 ? "book" : "books",
      categories: count === 1 ? "category" : "categories",
      categoryBooks:
        count === 1 ? "book in this category" : "books in this category",
    };
    return labels[kind] || "";
  }

  const categoryLabels = {
    one: "تصنيف",
    two: "تصنيف",
    few: "تصنيفات",
    many: "تصنيف",
  };
  const bookLabels = {
    one: "كتاب",
    two: "كتاب",
    few: "كتب",
    many: "كتاب",
  };
  const form = count === 1 ? "one" : count === 2 ? "two" : count >= 3 && count <= 10 ? "few" : "many";
  if (kind === "categories") return categoryLabels[form];
  if (kind === "categoryBooks") {
    return `${bookLabels[form]} في هذا التصنيف`;
  }
  return bookLabels[form];
};

export const formatActiveFilterLabel = (value, language) => {
  const count = Number(value || 0);
  const copy = getCatalogCopy(language);
  return `${formatCatalogNumber(count, language)} ${
    count === 1 ? copy.activeFilter : copy.activeFilters
  }`;
};

export const compareCatalogText = (left, right, language) =>
  String(left || "").localeCompare(String(right || ""), localeFor(language), {
    sensitivity: "base",
  });
