import { Box, Typography } from "@mui/material";

export default function SummarySection({ section }) {
  if (!section) return null;

  return (
    <Box
      sx={{
        py: 6,
        px: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 2,
        }}
      >
        {section.title}
      </Typography>

      <Typography>
        {typeof section.content === "string"
          ? section.content
          : section.content?.text}
      </Typography>
    </Box>
  );
}
