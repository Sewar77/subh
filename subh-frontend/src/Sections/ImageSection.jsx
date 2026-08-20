import { Box } from "@mui/material";
import {
  getAppearanceValue,
  mapAppearanceToStyle,
  imageVariantStyles,
  imageFitStyles,
  imagePositionStyles,
  imageHeightStyles,
} from "../Utils/appearanceMapping";

export default function ImageSection({ section, priority = false }) {
  const imageUrl = section.content.image;
  if (!imageUrl) return null;

  const appearance = section.appearance || {};

  // Get appearance values with defaults
  const variant = getAppearanceValue(appearance, "variant", "standard");
  const imageFit = getAppearanceValue(appearance, "imageFit", "contain");
  const imagePosition = getAppearanceValue(
    appearance,
    "imagePosition",
    "center",
  );
  const height = getAppearanceValue(appearance, "height", "standard");

  // Map appearance values to styles
  const variantSx = mapAppearanceToStyle(
    imageVariantStyles,
    variant,
    imageVariantStyles.standard,
  );
  const objectFit = mapAppearanceToStyle(
    imageFitStyles,
    imageFit,
    imageFitStyles.contain,
  );
  const positionSx = mapAppearanceToStyle(
    imagePositionStyles,
    imagePosition,
    imagePositionStyles.center,
  );
  const heightSx = mapAppearanceToStyle(
    imageHeightStyles,
    height,
    imageHeightStyles.standard,
  );

  const containerSx = {
    py: 6,
    display: "flex",
    ...positionSx,
  };

  const imageSx = {
    width: variant === "full_width" ? "100%" : "100%",
    maxWidth: variant === "full_width" ? "100%" : "1200px",
    ...heightSx,
    ...variantSx,
    display: "block",
    objectFit,
    bgcolor: "action.hover",
  };

  return (
    <Box sx={containerSx}>
      <Box
        component="img"
        src={imageUrl}
        alt={section.content.alt || section.title || ""}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        sx={imageSx}
      />
    </Box>
  );
}
