import { Box, Typography } from "@mui/material";

export default function TextSection({ section }) {
  const { title, content, align = "center" } = section || {};

  if (!section) return null;

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          maxWidth: "800px",
          width: "100%",
          textAlign: align,
          transition: "all 0.3s ease",
        }}
      >
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

        {/* CONTENT */}
        {content && (
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.9,
              opacity: 0.9,
              fontSize: "1.05rem",
            }}
          >
            {content}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
