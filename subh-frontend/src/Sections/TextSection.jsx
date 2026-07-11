import { Box, Typography, Paper } from "@mui/material";

export default function TextSection({ section }) {
  const { title, content, align = "center" } = section || {};

  if (!section) return null;

  const textItems =
    typeof content === "string"
      ? [content]
      : content && typeof content === "object"
        ? Object.values(content)
        : [];

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
          maxWidth: "1000px",
          width: "100%",
          textAlign: align,
        }}
      >
        {title && (
          <Typography
            variant="h4"
            sx={{
              position: "relative",
              display: "inline-block",
              fontWeight: 700,
              mb: 5,
              "&::after": {
                mx: "auto",
                content: '""',
                position: "absolute",
                left: 0,
                bottom: -8,
                width: "100%",
                height: "4px",
                borderRadius: "4px",
                background: "linear-gradient(90deg, #41f2c3, #102943)",
              },
            }}
          >
            {title}
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              textItems.length > 1
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
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                textAlign: "start",
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                transition: "0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 4,
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.9,
                  opacity: 0.9,
                  fontSize: "1.05rem",
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
