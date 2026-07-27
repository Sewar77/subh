const deserializeValue = (value, fieldType) => {
  if (value === null) return null;
  if (fieldType === "boolean") return value === true || value === "true";
  if (fieldType === "integer" || fieldType === "decimal") {
    return Number(value);
  }
  return value;
};

export const serializeSectionContentObject = (records = []) => {
  const content = {};

  for (const record of records) {
    const fieldKey = record.field_key;
    if (!fieldKey) continue;
    const value = deserializeValue(record.field_value, record.field_type);

    if (record.locale === "neutral") {
      content[fieldKey] = value;
      continue;
    }

    if (!content[fieldKey] || typeof content[fieldKey] !== "object") {
      content[fieldKey] = {};
    }
    content[fieldKey][record.locale] = value;
  }

  return content;
};

const addMediaCompatibilityFields = (content, mediaRows, templateKey) => {
  for (const media of mediaRows) {
    content[media.slot_key] = media.file_ref;
  }

  const firstMedia = mediaRows[0];
  if (firstMedia) {
    content.image = firstMedia.file_ref;
  }
  if (
    firstMedia &&
    ["image_text", "text_image"].includes(templateKey)
  ) {
    content.img = firstMedia.file_ref;
  }
};

export const attachMediaToTranslations = (
  translations,
  mediaRows,
  templateKey,
) =>
  translations.map((translation) => {
    const content = { ...(translation.content || {}) };
    addMediaCompatibilityFields(content, mediaRows, templateKey);
    return { ...translation, content };
  });

export const buildStructuredTranslations = (
  sectionId,
  templateKey,
  records = [],
  mediaRows = [],
) => {
  if (records.length === 0 && mediaRows.length === 0) return [];

  const structured = serializeSectionContentObject(records);
  const neutralFields = Object.fromEntries(
    Object.entries(structured).filter(
      ([, value]) => !value || typeof value !== "object" || Array.isArray(value),
    ),
  );

  return ["en", "ar"].map((locale) => {
    const localizedFields = {};
    for (const [fieldKey, value] of Object.entries(structured)) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.hasOwn(value, locale)
      ) {
        localizedFields[fieldKey] = value[locale];
      }
    }

    const title = localizedFields.title ?? neutralFields.title ?? null;
    delete localizedFields.title;
    const content = { ...neutralFields, ...localizedFields };
    delete content.title;
    addMediaCompatibilityFields(content, mediaRows, templateKey);

    return {
      id: null,
      section_id: sectionId,
      locale,
      title,
      content,
      is_visible: true,
      source: "structured",
    };
  });
};

export const serializeLegacyTranslations = (rows = []) =>
  rows.map((row) => ({
    id: row.id,
    section_id: row.section_id,
    locale: row.locale,
    title: row.title,
    content: row.content || {},
    is_visible: row.is_visible ?? true,
    source: "legacy",
  }));

export const serializeLegacyContentObject = (rows = [], template = null) => {
  const content = {};

  for (const row of rows) {
    if (row.title !== undefined) {
      content.title ||= {};
      content.title[row.locale] = row.title;
    }

    for (const [fieldKey, value] of Object.entries(row.content || {})) {
      if (["image", "img"].includes(fieldKey)) continue;
      const normalizedKey =
        ["content", "subtitle"].includes(fieldKey) &&
        template?.fields.some(({ key }) => key === "text")
          ? "text"
          : fieldKey;
      const definition = template?.fields.find(({ key }) => key === normalizedKey);
      if (definition?.localized !== false) {
        content[normalizedKey] ||= {};
        content[normalizedKey][row.locale] = value;
      } else if (!Object.hasOwn(content, normalizedKey)) {
        content[normalizedKey] = value;
      }
    }
  }

  return content;
};
