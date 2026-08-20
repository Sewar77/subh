import { Box, Typography } from "@mui/material";
import {
  getAppearanceValue,
  mapAppearanceToStyle,
  imageTextVariantStyles,
  imageFitStyles,
  spacingStyles,
} from "../Utils/appearanceMapping";

export default function ImageTextSection({ section }) {
  const { title, text, img, reverse = false } = section || {};

  if (!section) return null;

  const appearance = section.appearance || {};

  // Get appearance values with defaults
  const variant = getAppearanceValue(appearance, "variant", "standard");
  const imageFit = getAppearanceValue(appearance, "imageFit", "cover");
  const verticalAlignment = getAppearanceValue(
    appearance,
    "verticalAlignment",
    "center",
  );
  const spacing = getAppearanceValue(appearance, "spacing", "standard");

  // Map appearance values to styles
  const variantSx = mapAppearanceToStyle(
    imageTextVariantStyles,
    variant,
    imageTextVariantStyles.standard,
  );
  const objectFit = mapAppearanceToStyle(
    imageFitStyles,
    imageFit,
    imageFitStyles.cover,
  );
  const alignItems = mapAppearanceToStyle(
    { top: "flex-start", center: "center", bottom: "flex-end" },
    verticalAlignment,
    "center",
  );
  const spacingSx = mapAppearanceToStyle(
    spacingStyles,
    spacing,
    spacingStyles.standard,
  );

  const isCard = variant === "card";
  const isOverlap = variant === "overlap";
  const defaultGap = spacingSx.gap || 6;

  const containerSx = {
    display: "flex",
    flexDirection: {
      xs: "column",
      md: reverse ? "row-reverse" : "row",
    },
    alignItems:
      alignItems === "flex-start"
        ? "flex-start"
        : alignItems === "flex-end"
          ? "flex-end"
          : "center",
    justifyContent: isOverlap ? "flex-start" : "space-evenly",
    ...(spacingSx && spacingSx !== {} ? { ...spacingSx } : { gap: defaultGap }),
    py: 8,
    px: 2,
    textAlign: { xs: "center", md: "left" },
    ...(isCard ? { ...variantSx } : {}),
    position: isOverlap ? "relative" : "static",
  };

  const imgSx = {
    width: { xs: "70%", md: "30%" },
    maxWidth: 400,
    aspectRatio: "4 / 3",
    borderRadius: isCard ? 3 : isOverlap ? 0 : 3,
    transition: "all 0.4s ease",
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.25))",
    objectFit,
    ...(isOverlap
      ? {
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "50%",
          maxWidth: "none",
          borderRadius: 0,
        }
      : {}),

    "&:hover": {
      transform: isOverlap
        ? "translateY(-50%) scale(1.02)"
        : "scale(1.05) rotate(1deg)",
    },
  };

  const textBoxSx = isCard
    ? {
        width: { xs: "90%", md: "40%" },
        ...variantSx,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }
    : isOverlap
      ? {
          width: { xs: "90%", md: "50%" },
          p: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: "rgba(97, 51, 137, 0.95)",
          color: "white",
          zIndex: 1,
        }
      : {
          width: { xs: "90%", md: "40%" },
          p: 5,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #613389, #bb40bf)",
          color: "white",
          transition: "all 0.4s ease",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",

          "&:hover": {
            transform: "translateY(-10px) scale(1.02)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          },
        };

  return (
    <Box sx={containerSx}>
      {/* IMAGE SIDE */}
      {img && (
        <Box
          component="img"
          src={img}
          alt={title || ""}
          loading={section.priority ? "eager" : "lazy"}
          fetchPriority={section.priority ? "high" : "auto"}
          decoding="async"
          sx={imgSx}
        />
      )}

      {/* TEXT CARD */}
      <Box sx={textBoxSx}>
        {/* TITLE */}
        {title && (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            {title}
          </Typography>
        )}

        {/* TEXT */}
        {text && (
          <Typography
            variant="body1"
            sx={{
              opacity: isCard || isOverlap ? 1 : 0.95,
              lineHeight: 1.8,
            }}
          >
            {text}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
