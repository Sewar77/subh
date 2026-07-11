export function prepareSection(section, language) {
  const translation = section.translations?.find(
    (item) => item.locale === language && item.is_visible,
  );

  if (!translation) return null;

  return {
    ...section,

    title: translation.title,

    content: translation.content || {},
  };
}
