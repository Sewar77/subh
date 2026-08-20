import { Box, Typography } from "@mui/material";
import {
  getAppearanceValue,
  imageFitStyles,
  mapAppearanceToStyle,
  spacingStyles,
} from "../Utils/appearanceMapping";

export default function MediaSection({ section }) {
  if (!section) return null;

  const appearance = section.appearance || {};
  const variant = getAppearanceValue(appearance, "variant", "grid");
  const spacing = getAppearanceValue(appearance, "spacing", "standard");
  const imageFit = getAppearanceValue(appearance, "imageFit", "cover");
  const spacingSx = mapAppearanceToStyle(spacingStyles, spacing, spacingStyles.standard);
  const objectFit = mapAppearanceToStyle(imageFitStyles, imageFit, imageFitStyles.cover);
  const canonicalMedia = (section.media || [])
    .map((item) => ({ url: item?.url || item?.fileRef, alt: item?.alt || section.title || "" }))
    .filter((item) => item.url);
  const fallback = section.content?.image || section.content?.video || section.content?.logo || section.content?.notes || section.content?.theme_image;
  const media = canonicalMedia.length ? canonicalMedia : fallback ? [{ url: fallback, alt: section.content?.alt || section.title || "" }] : [];
  if (!media.length) return null;

  return (
    <Box component="section" sx={{ py: spacingSx.py, px: { xs: 0.5, sm: 2 } }}>
      <Box sx={{ width: "100%", maxWidth: 1120, mx: "auto" }}>
        {section.title && (
          <Typography component="h2" variant="h4" sx={{ fontWeight: 820, mb: 2, fontSize: { xs: "1.7rem", md: "2.1rem" } }}>
            {section.title}
          </Typography>
        )}
        <Box
          sx={{
            display: variant === "stack" ? "flex" : "grid",
            flexDirection: "column",
            gridAutoFlow: variant === "carousel" ? "column" : "row",
            gridAutoColumns: variant === "carousel" ? { xs: "82%", sm: "48%", md: "34%" } : undefined,
            gridTemplateColumns: variant === "grid" ? "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" : undefined,
            gap: spacingSx.gap || 2.5,
            overflowX: variant === "carousel" ? "auto" : "visible",
            scrollSnapType: variant === "carousel" ? "x proximity" : undefined,
            pb: variant === "carousel" ? 1 : 0,
          }}
        >
          {media.map((item, index) => (
            <Box
              key={`${item.url}:${index}`}
              component="img"
              src={item.url}
              alt={item.alt}
              loading={section.priority && index === 0 ? "eager" : "lazy"}
              fetchPriority={section.priority && index === 0 ? "high" : "auto"}
              decoding="async"
              sx={{ width: "100%", aspectRatio: variant === "stack" ? "16 / 7" : "4 / 3", maxHeight: variant === "stack" ? 420 : 360, objectFit, bgcolor: "action.hover", borderRadius: 2.5, boxShadow: 2, scrollSnapAlign: "start" }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
