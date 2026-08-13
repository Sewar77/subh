export function prepareSection(section, language) {
  const translation = section.translations?.find(
    (item) => item.locale === language && item.is_visible,
  );
  const content = section.content || translation?.content;

  if (!content) return null;

  return {
    ...section,

    title: content.title ?? translation?.title,

    content,
  };
}
