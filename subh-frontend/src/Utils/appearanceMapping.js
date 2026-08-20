/**
 * Safe appearance value mappers for public section rendering.
 * These provide controlled allowlisted mappings between backend appearance
 * values and frontend styles/variants.
 * Invalid or unknown values fall back to defaults safely.
 */

// Hero appearance mappings
export const heroVariantStyles = {
  centered: { layout: "centered" },
  split: { layout: "split" },
  minimal: { layout: "minimal" },
};

export const heroHeightStyles = {
  compact: { py: { xs: 4, md: 6 }, minHeight: { xs: 180, md: 280 } },
  standard: { py: { xs: 6, md: 8 }, minHeight: { xs: 280, md: 420 } },
  large: { py: { xs: 8, md: 12 }, minHeight: { xs: 380, md: 620 } },
};

export const contentWidthStyles = {
  narrow: { maxWidth: 600 },
  standard: { maxWidth: 900 },
  wide: { maxWidth: 1200 },
};

export const alignmentStyles = {
  left: { textAlign: "left", justifyContent: "flex-start" },
  center: { textAlign: "center", justifyContent: "center" },
  right: { textAlign: "right", justifyContent: "flex-end" },
};

// Image appearance mappings
export const imageVariantStyles = {
  standard: { borderRadius: 4, boxShadow: 3 },
  framed: { borderRadius: 2, boxShadow: 6, border: "8px solid white" },
  full_width: { borderRadius: 0, boxShadow: 0 },
};

export const imageFitStyles = {
  cover: "cover",
  contain: "contain",
};

export const imagePositionStyles = {
  left: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  right: { justifyContent: "flex-end" },
};

export const imageHeightStyles = {
  compact: { aspectRatio: "16 / 9", maxHeight: { xs: 200, md: 300 } },
  standard: { aspectRatio: "16 / 9", maxHeight: { xs: 300, md: 450 } },
  large: { aspectRatio: "16 / 9", maxHeight: { xs: 400, md: 600 } },
};

// Text appearance mappings
export const textVariantStyles = {
  article: { variant: "body1", fontSize: "1.1rem", lineHeight: 1.8 },
  centered: { textAlign: "center" },
  highlight: {
    p: 4,
    bgcolor: "action.hover",
    borderRadius: 2,
    borderLeft: "4px solid primary.main",
  },
};

// Media section appearance mappings
export const mediaVariantStyles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 3,
  },
  carousel: { display: "flex", overflowX: "auto", gap: 2, pb: 2 },
  stack: { display: "flex", flexDirection: "column", gap: 3 },
};

export const spacingStyles = {
  compact: { gap: 1.5, py: 3 },
  standard: { gap: 3, py: 6 },
  relaxed: { gap: 4.5, py: 9 },
};

// Image text appearance mappings
export const imageTextVariantStyles = {
  standard: { gap: 6 },
  card: { gap: 4, p: 4, boxShadow: 3, borderRadius: 3 },
  overlap: { gap: 0, position: "relative" },
};

export const verticalAlignmentStyles = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
};

// Banner appearance mappings
export const bannerVariantStyles = {
  cta: { bgcolor: "primary.main", color: "primary.contrastText" },
  announcement: {
    bgcolor: "warning.light",
    borderLeft: "4px solid warning.main",
  },
  image: { bgcolor: "background.paper", borderRadius: 3, boxShadow: 3 },
};

export const bannerHeightStyles = {
  compact: { py: 3, minHeight: 100 },
  standard: { py: 5, minHeight: 150 },
};

// Summary appearance mappings
export const summaryVariantStyles = {
  standard: { bgcolor: "background.default", py: 6, px: 3 },
  highlight: {
    bgcolor: "info.light",
    p: 4,
    borderRadius: 2,
    borderLeft: "4px solid info.main",
  },
  card: { bgcolor: "background.paper", p: 4, borderRadius: 3, boxShadow: 3 },
};

/**
 * Safe getter for appearance value with fallback
 * @param {object} appearance - The appearance object from section
 * @param {string} key - The appearance key (e.g., "variant", "height")
 * @param {string} defaultValue - The default value if key doesn't exist
 * @returns {any} The appearance value or default
 */
export const getAppearanceValue = (appearance, key, defaultValue) => {
  if (!appearance || typeof appearance !== "object") {
    return defaultValue;
  }
  const value = appearance[key];
  return value !== undefined && value !== null ? value : defaultValue;
};

/**
 * Safe style mapper with fallback
 * @param {object} mappings - Object mapping appearance values to styles
 * @param {any} value - The appearance value
 * @param {any} defaultStyle - Default style if value not in mappings
 * @returns {any} The mapped style or default
 */
export const mapAppearanceToStyle = (mappings, value, defaultStyle = {}) => {
  if (!mappings || typeof mappings !== "object") {
    return defaultStyle;
  }
  const style = mappings[value];
  return style !== undefined ? style : defaultStyle;
};
