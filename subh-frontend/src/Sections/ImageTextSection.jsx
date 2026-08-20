import { Box, Paper, Typography } from "@mui/material";
import {
  getAppearanceValue,
  imageFitStyles,
  mapAppearanceToStyle,
  spacingStyles,
  verticalAlignmentStyles,
} from "../Utils/appearanceMapping";

export default function ImageTextSection({ section }) {
  if (!section) return null;

  const { title, text, img, reverse = false } = section;
  const appearance = section.appearance || {};
  const variant = getAppearanceValue(appearance, "variant", "standard");
  const imageFit = getAppearanceValue(appearance, "imageFit", "cover");
  const verticalAlignment = getAppearanceValue(appearance, "verticalAlignment", "center");
  const spacing = getAppearanceValue(appearance, "spacing", "standard");
  const spacingSx = mapAppearanceToStyle(spacingStyles, spacing, spacingStyles.standard);
  const objectFit = mapAppearanceToStyle(imageFitStyles, imageFit, imageFitStyles.cover);
  const alignItems = mapAppearanceToStyle(verticalAlignmentStyles, verticalAlignment, "center");
  const card = variant === "card";
  const overlap = variant === "overlap";

  return (
    <Box component="section" sx={{ py: spacingSx.py, px: { xs: 0.5, sm: 2 } }}>
      <Paper
        elevation={card ? 2 : 0}
        variant={card || overlap ? "outlined" : undefined}
        sx={{
          maxWidth: 1120,
          mx: "auto",
          p: card ? { xs: 2, md: 2.5 } : overlap ? { xs: 2, md: 3 } : 0,
          display: "flex",
          flexDirection: { xs: "column", md: reverse ? "row-reverse" : "row" },
          alignItems,
          gap: spacingSx.gap || { xs: 2.5, md: 4 },
          overflow: "hidden",
          borderRadius: card || overlap ? 3 : 0,
          bgcolor: overlap ? "rgba(16,41,67,.035)" : "background.paper",
        }}
      >
        {img && (
          <Box sx={{ flex: "1 1 50%", width: "100%", minWidth: 0 }}>
            <Box
              component="img"
              src={img}
              alt={section.content?.alt || title || ""}
              loading={section.priority ? "eager" : "lazy"}
              fetchPriority={section.priority ? "high" : "auto"}
              decoding="async"
              sx={{
                display: "block",
                width: "100%",
                aspectRatio: { xs: "16 / 10", md: "4 / 3" },
                maxHeight: 420,
                objectFit,
                borderRadius: 2.5,
                bgcolor: "action.hover",
              }}
            />
          </Box>
        )}
        <Box sx={{ flex: "1 1 50%", minWidth: 0, px: { xs: 0.5, md: card || overlap ? 1.5 : 2 }, py: { xs: 1, md: 2 }, textAlign: "start" }}>
          {title && (
            <Typography component="h2" variant="h4" sx={{ fontWeight: 820, mb: text ? 1.5 : 0, fontSize: { xs: "1.7rem", md: "2.15rem" }, lineHeight: 1.25 }}>
              {title}
            </Typography>
          )}
          {text && (
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, maxWidth: 620 }}>
              {text}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
