import { Box, Typography } from "@mui/material";

export default function HeroSection({ section }) {
  if (!section) return null;

  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 800,
        }}
      >
        {section.title}
      </Typography>

      {section.content?.text && (
        <Typography
          sx={{
            mt: 2,
          }}
        >
          {section.content.text}
        </Typography>
      )}
    </Box>
  );
}
