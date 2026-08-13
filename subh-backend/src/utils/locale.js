export const PUBLIC_LOCALES = new Set(["en", "ar"]);

export const normalizePublicLocale = (value) =>
  PUBLIC_LOCALES.has(value) ? value : "en";

export const getPublicLocaleColumns = (locale, aliases = {}) => {
  const language = normalizePublicLocale(locale);
  const suffix = language === "ar" ? "ar" : "en";
  const book = aliases.book || "b";
  const category = aliases.category || "c";
  const author = aliases.author || "a";

  return {
    language,
    bookName: `${book}.name_${suffix} AS name`,
    bookDescription: `${book}.description_${suffix} AS description`,
    categoryName: `${category}.name_${suffix} AS category_name`,
    categoryDescription: `${category}.description_${suffix} AS category_description`,
    authorName: `${author}.name_${suffix} AS name`,
  };
};
