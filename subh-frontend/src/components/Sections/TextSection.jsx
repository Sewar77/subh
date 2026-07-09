import { Box, Typography, Container } from "@mui/material";

export default function TextSection({ section }) {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background:
          "linear-gradient(180deg, rgba(245,247,250,0.8), rgba(255,255,255,1))",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            position: "relative",
            textAlign: "center",
          }}
        >
         
          <Box
            sx={{
              width: 70,
              height: 5,
              borderRadius: 10,
              backgroundColor: "primary.main",
              margin: "0 auto 24px",
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: {
                xs: "2rem",
                md: "3rem",
              },
              lineHeight: 1.2,
              mb: 3,
              color: "text.primary",
            }}
          >
            {section.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: {
                xs: "1rem",
                md: "1.25rem",
              },
              lineHeight: 1.9,
              color: "text.secondary",
              letterSpacing: "0.2px",
              whiteSpace: "pre-line",
            }}
          >
            {section.content?.text}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
