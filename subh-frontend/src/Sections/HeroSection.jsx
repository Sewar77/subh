import { Box, Button, Container, Stack, Typography } from "@mui/material";
import {
  alignmentStyles,
  contentWidthStyles,
  getAppearanceValue,
  heroHeightStyles,
  mapAppearanceToStyle,
} from "../Utils/appearanceMapping";

export default function HeroSection({ section }) {
  if (!section) return null;

  const appearance = section.appearance || {};
  const variant = getAppearanceValue(appearance, "variant", "centered");
  const height = getAppearanceValue(appearance, "height", "standard");
  const contentWidth = getAppearanceValue(appearance, "contentWidth", "standard");
  const alignment = getAppearanceValue(appearance, "alignment", "center");
  const background = section.content?.background;
  const heightSx = mapAppearanceToStyle(heroHeightStyles, height, heroHeightStyles.standard);
  const contentWidthSx = mapAppearanceToStyle(contentWidthStyles, contentWidth, contentWidthStyles.standard);
  const alignmentSx = mapAppearanceToStyle(alignmentStyles, alignment, alignmentStyles.center);
  const minimal = variant === "minimal";

  return (
    <Box
      component="section"
      sx={{
        ...heightSx,
        position: "relative",
        isolation: "isolate",
        display: "grid",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: { xs: 3, md: 4 },
        border: "1px solid",
        borderColor: background ? "transparent" : "rgba(101,70,163,.14)",
        color: background ? "common.white" : "text.primary",
        background: background
          ? `linear-gradient(115deg, rgba(16,41,67,.9), rgba(64,39,92,.7)), url("${background}") center / cover`
          : "linear-gradient(135deg, rgba(16,41,67,.06), rgba(101,70,163,.08) 55%, rgba(85,201,181,.09))",
        px: { xs: 0.5, sm: 1.5 },
        "&::after": {
          content: '""',
          position: "absolute",
          zIndex: -1,
          width: { xs: 180, md: 300 },
          height: { xs: 180, md: 300 },
          borderRadius: "50%",
          insetInlineEnd: -90,
          insetBlockEnd: -160,
          bgcolor: background ? "rgba(85,201,181,.13)" : "rgba(192,82,169,.08)",
          filter: "blur(8px)",
        },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={{ xs: 1.5, md: 2 }}
          sx={{
            ...contentWidthSx,
            mx: alignmentSx.textAlign === "center" ? "auto" : 0,
            textAlign: alignmentSx.textAlign,
            alignItems: alignmentSx.textAlign === "center" ? "center" : "flex-start",
          }}
        >
          {section.title && (
            <Typography
              component="h1"
              variant={minimal ? "h4" : "h2"}
              sx={{
                fontWeight: 850,
                fontSize: minimal
                  ? { xs: "1.7rem", md: "2.2rem" }
                  : { xs: "2.15rem", sm: "2.75rem", md: "3.35rem" },
                lineHeight: 1.12,
                maxWidth: 820,
              }}
            >
              {section.title}
            </Typography>
          )}
          {section.content?.text && (
            <Typography sx={{ maxWidth: 720, fontSize: minimal ? "1rem" : { xs: "1rem", md: "1.1rem" }, lineHeight: 1.7, opacity: background ? 0.92 : 0.8 }}>
              {section.content.text}
            </Typography>
          )}
          {section.content?.buttonText && section.content?.buttonLink && (
            <Button href={section.content.buttonLink} variant="contained" sx={{ mt: 0.5, minHeight: 42, px: 2.5 }}>
              {section.content.buttonText}
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
