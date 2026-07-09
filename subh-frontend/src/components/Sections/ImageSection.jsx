import { Box, Typography } from "@mui/material";

export default function ImageSection({ section }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {section.title}
      </Typography>

      <img
        src={section.content.image}
        alt={section.title}
        style={{ width: "100%", borderRadius: 8 }}
      />
    </Box>
  );
}
