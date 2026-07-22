import { Box, Typography } from "@mui/material";

export default function BannerSection({ section }) {
  if (!section) return null;

  return (
    <Box
      sx={{
        py: 5,
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
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
