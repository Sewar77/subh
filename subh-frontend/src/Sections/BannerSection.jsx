import { Box, Typography, Button, Stack } from "@mui/material";
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
      component="section"
      sx={{
        ...heightSx,
        px: { xs: 2.5, md: 4 },
        textAlign: alignmentSx.textAlign,
        display: "flex",
        alignItems: "center",
        justifyContent: alignmentSx.justifyContent,
        maxWidth: 1120,
        mx: "auto",
        my: { xs: 3, md: 5 },
        borderRadius: 3,
        overflow: "hidden",
        ...variantSx,
      }}
    >
      <Stack spacing={1.25} alignItems={alignmentSx.textAlign === "center" ? "center" : "flex-start"} sx={{ maxWidth: 820 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 820,
            fontSize: { xs: "1.65rem", md: "2.2rem" },
          }}
        >
          {section.title}
        </Typography>

        {section.content?.text && (
          <Typography
            sx={{
              fontSize: isAnnouncement ? "1rem" : "1.1rem",
              opacity: isCta ? 1 : 0.9,
              lineHeight: 1.65,
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
              href={section.content.buttonLink}
              sx={{
                mt: 0.5,
                minHeight: 42,
                px: 2.5,
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
      </Stack>
    </Box>
  );
}
