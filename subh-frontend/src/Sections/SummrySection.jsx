import { Box, Typography } from "@mui/material";
import {
  getAppearanceValue,
  mapAppearanceToStyle,
  summaryVariantStyles,
  contentWidthStyles,
  alignmentStyles,
} from "../Utils/appearanceMapping";

export default function SummarySection({ section }) {
  if (!section) return null;

  const appearance = section.appearance || {};

  // Get appearance values with defaults
  const variant = getAppearanceValue(appearance, "variant", "standard");
  const contentWidth = getAppearanceValue(
    appearance,
    "contentWidth",
    "standard",
  );
  const alignment = getAppearanceValue(appearance, "alignment", "center");

  // Map appearance values to styles
  const variantSx = mapAppearanceToStyle(
    summaryVariantStyles,
    variant,
    summaryVariantStyles.standard,
  );
  const contentWidthSx = mapAppearanceToStyle(
    contentWidthStyles,
    contentWidth,
    contentWidthStyles.standard,
  );
  const alignmentSx = mapAppearanceToStyle(
    alignmentStyles,
    alignment,
    alignmentStyles.center,
  );

  const isHighlight = variant === "highlight";

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        justifyContent: alignmentSx.justifyContent,
        maxWidth: 1120,
        mx: "auto",
        my: { xs: 3, md: 5 },
        borderRadius: 3,
        ...variantSx,
      }}
    >
      <Box
        sx={{
          ...contentWidthSx,
          width: "100%",
          textAlign: alignmentSx.textAlign,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 820,
            mb: 1.25,
            fontSize: { xs: "1.65rem", md: "2rem" },
            ...(isHighlight ? { color: "info.dark" } : {}),
          }}
        >
          {section.title}
        </Typography>

        <Typography
          sx={{
            lineHeight: 1.75,
            maxWidth: 760,
            mx: alignmentSx.textAlign === "center" ? "auto" : 0,
            ...(isHighlight ? { color: "info.dark" } : {}),
          }}
        >
          {typeof section.content === "string"
            ? section.content
            : section.content?.text}
        </Typography>
      </Box>
    </Box>
  );
}
