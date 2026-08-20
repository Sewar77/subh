import { Box, Paper, Typography } from "@mui/material";
import {
  alignmentStyles,
  contentWidthStyles,
  getAppearanceValue,
  mapAppearanceToStyle,
} from "../Utils/appearanceMapping";

export default function TextSection({ section }) {
  if (!section) return null;

  const appearance = section.appearance || {};
  const variant = getAppearanceValue(appearance, "variant", "article");
  const contentWidth = getAppearanceValue(appearance, "contentWidth", "standard");
  const alignment = getAppearanceValue(appearance, "alignment", "center");
  const contentWidthSx = mapAppearanceToStyle(contentWidthStyles, contentWidth, contentWidthStyles.standard);
  const alignmentSx = mapAppearanceToStyle(alignmentStyles, alignment, alignmentStyles.center);
  const highlighted = variant === "highlight";
  const centered = variant === "centered";
  const text = typeof section.content === "string" ? section.content : section.content?.text;
  if (!section.title && !text) return null;

  const content = (
    <Box sx={{ ...contentWidthSx, width: "100%", mx: alignmentSx.textAlign === "center" ? "auto" : 0, textAlign: alignmentSx.textAlign }}>
      {section.title && (
        <Typography component="h2" variant={centered || highlighted ? "h4" : "h5"} sx={{ fontWeight: 800, mb: text ? 1.5 : 0, lineHeight: 1.25 }}>
          {section.title}
        </Typography>
      )}
      {text && (
        <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.85, fontSize: { xs: "1rem", md: "1.06rem" }, color: highlighted ? "inherit" : "text.secondary" }}>
          {text}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box component="section" sx={{ py: { xs: 3.5, md: 5.5 }, px: { xs: 0.5, sm: 2 } }}>
      {highlighted ? (
        <Paper variant="outlined" sx={{ maxWidth: 960, mx: "auto", p: { xs: 2.5, md: 3.5 }, borderRadius: 3, borderInlineStart: "4px solid", borderInlineStartColor: "secondary.main", background: "linear-gradient(135deg, rgba(85,201,181,.09), rgba(101,70,163,.06))" }}>
          {content}
        </Paper>
      ) : content}
    </Box>
  );
}
