import { Box, Typography, Paper } from "@mui/material";
import {
  getAppearanceValue,
  mapAppearanceToStyle,
  textVariantStyles,
  contentWidthStyles,
  alignmentStyles,
} from "../Utils/appearanceMapping";

export default function TextSection({ section }) {
  const { title, content, align = "center" } = section || {};

  if (!section) return null;

  const appearance = section.appearance || {};

  // Get appearance values with defaults
  const variant = getAppearanceValue(appearance, "variant", "article");
  const contentWidth = getAppearanceValue(
    appearance,
    "contentWidth",
    "standard",
  );
  const alignment = getAppearanceValue(appearance, "alignment", "center");

  // Map appearance values to styles
  const variantSx = mapAppearanceToStyle(textVariantStyles, variant, {});
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

  const textItems =
    typeof content === "string"
      ? [content]
      : content && typeof content === "object"
        ? Object.values(content)
        : [];

  const isHighlight = variant === "highlight";
  const isCentered = variant === "centered";

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        display: "flex",
        justifyContent: alignmentSx.justifyContent,
      }}
    >
      <Box
        sx={{
          ...contentWidthSx,
          width: "100%",
          textAlign: alignmentSx.textAlign,
        }}
      >
        {title && (
          <Typography
            variant={isCentered || isHighlight ? "h4" : "h5"}
            sx={{
              position: "relative",
              display: isCentered ? "inline-block" : "block",
              fontWeight: 700,
              mb: 5,
              ...(variant !== "highlight"
                ? {
                    "&::after": {
                      mx: alignmentSx.textAlign === "center" ? "auto" : 0,
                      content: '""',
                      position: "absolute",
                      left: alignmentSx.textAlign === "right" ? "auto" : 0,
                      right: alignmentSx.textAlign === "right" ? 0 : "auto",
                      bottom: -8,
                      width: isCentered ? "100%" : "60px",
                      height: "4px",
                      borderRadius: "4px",
                      background: "linear-gradient(90deg, #41f2c3, #102943)",
                    },
                  }
                : {}),
            }}
          >
            {title}
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              textItems.length > 1 && !isHighlight
                ? {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                  }
                : "1fr",
            gap: 3,
            mt: 2,
          }}
        >
          {textItems.map((text, index) => (
            <Paper
              key={index}
              elevation={isHighlight ? 0 : 0}
              sx={{
                ...(isHighlight
                  ? {
                      p: 4,
                      bgcolor: "info.light",
                      borderLeft: "4px solid",
                      borderColor: "info.main",
                      borderRadius: 0,
                    }
                  : {
                      p: 4,
                      borderRadius: 3,
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                    }),
                textAlign: "start",
              }}
            >
              <Typography
                sx={{
                  lineHeight: 1.8,
                  color: isHighlight ? "info.dark" : "text.primary",
                }}
              >
                {text}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
