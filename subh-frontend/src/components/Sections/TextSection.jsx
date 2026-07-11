import { Box, Typography, Container } from "@mui/material";

function getText(value) {
  if (!value) return "";

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getText).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).map(getText).join(" ");
  }

  return "";
}

export default function TextSection({ section }) {
  const text = getText(section.content?.text);

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              color: "text.primary",
            }}
          >
            {section.title}
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: "1rem",
                md: "1.25rem",
              },
              lineHeight: 2,
              color: "text.primary",
              whiteSpace: "pre-line",
            }}
          >
            {text}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
