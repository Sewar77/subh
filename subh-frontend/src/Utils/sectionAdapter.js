export function prepareSection(section, language) {
  if (!section || typeof section !== "object") return null;

  const translation = section.translations?.find(
    (item) => item.locale === language && item.is_visible,
  );
  const sourceContent = section.content || translation?.content;

  if (!sourceContent || typeof sourceContent !== "object") return null;

  const templateKey = section.templateKey || section.type;
  if (!templateKey) return null;

  const content = { ...sourceContent };
  const media = Array.isArray(section.media) ? section.media : [];
  for (const item of media) {
    const slot = item?.slot || item?.slotKey;
    const fileRef = item?.url || item?.fileRef;
    if (slot && fileRef && !content[slot]) content[slot] = fileRef;
  }

  const firstMedia = media.find((item) => item?.url || item?.fileRef);
  const firstMediaRef = firstMedia?.url || firstMedia?.fileRef;
  if (firstMediaRef && !content.image) content.image = firstMediaRef;
  if (
    firstMediaRef &&
    ["image_text", "text_image"].includes(templateKey) &&
    !content.img
  ) {
    content.img = firstMediaRef;
  }
  if (firstMedia?.alt && !content.alt) content.alt = firstMedia.alt;

  const title = content.title ?? translation?.title;
  const appearance = section.appearance || {};

  return {
    ...section,
    type: templateKey,
    templateKey,
    title,
    content,
    text: content.text,
    img: content.img || content.image,
    reverse: templateKey === "text_image",
    appearance,
  };
}
