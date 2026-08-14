import { Box, Typography } from "@mui/material";

export default function HeroSection({ section }) {
  if (!section) return null;
  const background = section.content?.background;

  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
        ...(background
          ? {
              backgroundImage: `linear-gradient(rgba(16, 41, 67, 0.55), rgba(16, 41, 67, 0.55)), url("${background}")`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              color: "common.white",
            }
          : {}),
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
