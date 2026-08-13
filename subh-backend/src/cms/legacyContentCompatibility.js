const TEXT_FIELD_ALIASES = new Set(["content", "subtitle"]);

// `items` exists in legacy translation JSON but has no registered template field
// or active public section consumer. It is intentionally excluded from both
// bootstrap and read fallback rather than widening the structured content model.
const OBSOLETE_LEGACY_FIELDS = new Set(["items"]);

export const isObsoleteLegacyContentField = (fieldKey) =>
  OBSOLETE_LEGACY_FIELDS.has(fieldKey);

export const normalizeLegacyContentFieldKey = (template, fieldKey) => {
  if (template?.fields.some(({ key }) => key === fieldKey)) return fieldKey;
  if (
    TEXT_FIELD_ALIASES.has(fieldKey) &&
    template?.fields.some(({ key }) => key === "text")
  ) {
    return "text";
  }
  return null;
};
