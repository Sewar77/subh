import { Box, Typography, Button } from "@mui/material";
import {
  getAppearanceValue,
  mapAppearanceToStyle,
  bannerVariantStyles,
  bannerHeightStyles,
  alignmentStyles,
} from "../Utils/appearanceMapping";

export default function BannerSection({ section }) {
  if (!section) return null;

  const appearance = section.appearance || {};

  // Get appearance values with defaults
  const variant = getAppearanceValue(appearance, "variant", "cta");
  const height = getAppearanceValue(appearance, "height", "standard");
  const alignment = getAppearanceValue(appearance, "alignment", "center");

  // Map appearance values to styles
  const variantSx = mapAppearanceToStyle(
    bannerVariantStyles,
    variant,
    bannerVariantStyles.cta,
  );
  const heightSx = mapAppearanceToStyle(
    bannerHeightStyles,
    height,
    bannerHeightStyles.standard,
  );
  const alignmentSx = mapAppearanceToStyle(
    alignmentStyles,
    alignment,
    alignmentStyles.center,
  );

  const isCta = variant === "cta";
  const isAnnouncement = variant === "announcement";

  return (
    <Box
      sx={{
        ...heightSx,
        px: 3,
        textAlign: alignmentSx.textAlign,
        display: "flex",
        alignItems: "center",
        justifyContent: alignmentSx.justifyContent,
        ...variantSx,
      }}
    >
      <Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: isAnnouncement ? 1 : 2,
          }}
        >
          {section.title}
        </Typography>

        {section.content?.text && (
          <Typography
            sx={{
              mb: isCta ? 2 : 0,
              fontSize: isAnnouncement ? "1rem" : "1.1rem",
              opacity: isCta ? 1 : 0.9,
            }}
          >
            {section.content.text}
          </Typography>
        )}

        {isCta &&
          section.content?.buttonText &&
          section.content?.buttonLink && (
            <Button
              variant="contained"
              size="large"
              href={section.content.buttonLink}
              sx={{
                mt: 1,
                bgcolor: isAnnouncement ? "warning.main" : "secondary.main",
                color: isAnnouncement ? "white" : "primary.main",

                "&:hover": {
                  bgcolor: isAnnouncement ? "warning.dark" : "secondary.dark",
                },
              }}
            >
              {section.content.buttonText}
            </Button>
          )}
      </Box>
    </Box>
  );
}
