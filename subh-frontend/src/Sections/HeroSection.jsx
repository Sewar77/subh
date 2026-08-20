import { Box, Typography, Button, Container } from "@mui/material";
import {
  getAppearanceValue,
  mapAppearanceToStyle,
  heroHeightStyles,
  contentWidthStyles,
  alignmentStyles,
} from "../Utils/appearanceMapping";

export default function HeroSection({ section }) {
  if (!section) return null;

  const background = section.content?.background;
  const appearance = section.appearance || {};

  // Get appearance values with defaults
  const variant = getAppearanceValue(appearance, "variant", "centered");
  const height = getAppearanceValue(appearance, "height", "standard");
  const contentWidth = getAppearanceValue(
    appearance,
    "contentWidth",
    "standard",
  );
  const alignment = getAppearanceValue(appearance, "alignment", "center");

  // Map appearance values to styles
  const heightSx = mapAppearanceToStyle(
    heroHeightStyles,
    height,
    heroHeightStyles.standard,
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

  // Variant-specific layout
  const isSplit = variant === "split";
  const isMinimal = variant === "minimal";

  const containerSx = {
    ...heightSx,
    textAlign: alignmentSx.textAlign,
    ...(background
      ? {
          backgroundImage: `linear-gradient(rgba(16, 41, 67, 0.55), rgba(16, 41, 67, 0.55)), url("${background}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundAttachment: { md: "fixed" },
          color: "common.white",
        }
      : {}),
    display: isSplit ? "flex" : "block",
    alignItems: "center",
    justifyContent: alignmentSx.justifyContent,
    px: 2,
  };

  const titleVariant = isMinimal ? "h4" : "h2";

  return (
    <Box sx={containerSx}>
      {isSplit ? (
        // Split variant: content and media side-by-side
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            gap: 4,
            alignItems: "center",
            justifyContent: "space-between",
            py: { xs: 4, md: 6 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={titleVariant}
              sx={{
                fontWeight: 800,
                mb: 2,
              }}
            >
              {section.title}
            </Typography>

            {section.content?.text && (
              <Typography sx={{ mb: 3, lineHeight: 1.6 }}>
                {section.content.text}
              </Typography>
            )}

            {section.content?.buttonText && section.content?.buttonLink && (
              <Button
                variant="contained"
                size="large"
                href={section.content.buttonLink}
                sx={{ mt: 2 }}
              >
                {section.content.buttonText}
              </Button>
            )}
          </Box>
        </Container>
      ) : (
        // Centered and minimal variants
        <Box sx={contentWidthSx}>
          <Typography
            variant={titleVariant}
            sx={{
              fontWeight: 800,
              mb: 2,
            }}
          >
            {section.title}
          </Typography>

          {section.content?.text && (
            <Typography
              sx={{
                mb: 3,
                fontSize: isMinimal ? "1rem" : "1.1rem",
                lineHeight: 1.6,
              }}
            >
              {section.content.text}
            </Typography>
          )}

          {section.content?.buttonText && section.content?.buttonLink && (
            <Button
              variant="contained"
              size="large"
              href={section.content.buttonLink}
              sx={{ mt: 2 }}
            >
              {section.content.buttonText}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
