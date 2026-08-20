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
      sx={{
        display: "flex",
        justifyContent: alignmentSx.justifyContent,
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
            fontWeight: 700,
            mb: 2,
            ...(isHighlight ? { color: "info.dark" } : {}),
          }}
        >
          {section.title}
        </Typography>

        <Typography
          sx={{
            lineHeight: 1.7,
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
