import { Box, Typography } from "@mui/material";
import {
  getAppearanceValue,
  mapAppearanceToStyle,
  mediaVariantStyles,
  spacingStyles,
  imageFitStyles,
} from "../Utils/appearanceMapping";

export default function MediaSection({ section, priority = false }) {
  if (!section) return null;

  const media =
    section.content?.image ||
    section.content?.video ||
    section.content?.logo ||
    section.content?.notes ||
    section.content?.theme_image;

  if (!media) return null;

  const appearance = section.appearance || {};

  // Get appearance values with defaults
  const variant = getAppearanceValue(appearance, "variant", "grid");
  const spacing = getAppearanceValue(appearance, "spacing", "standard");
  const imageFit = getAppearanceValue(appearance, "imageFit", "cover");

  // Map appearance values to styles
  const variantSx = mapAppearanceToStyle(
    mediaVariantStyles,
    variant,
    mediaVariantStyles.grid,
  );
  const spacingSx = mapAppearanceToStyle(
    spacingStyles,
    spacing,
    spacingStyles.standard,
  );
  const objectFit = mapAppearanceToStyle(
    imageFitStyles,
    imageFit,
    imageFitStyles.cover,
  );

  const containerSx = {
    ...spacingSx,
    px: 2,
    display: "flex",
    justifyContent: "center",
  };

  const mediaSx = {
    width: "100%",
    maxWidth: "1200px",
    aspectRatio: "16 / 9",
    objectFit,
    bgcolor: "action.hover",
    borderRadius: variant === "carousel" ? 2 : 3,
    transition: "all 0.3s ease",

    "&:hover": {
      transform: variant === "carousel" ? "translateX(4px)" : "scale(1.02)",
    },
  };

  return (
    <Box sx={containerSx}>
      <Box
        sx={{
          ...variantSx,
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {section.title && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            {section.title}
          </Typography>
        )}

        <Box
          component="img"
          src={media}
          alt={section.title || ""}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          sx={mediaSx}
        />
      </Box>
    </Box>
  );
}
