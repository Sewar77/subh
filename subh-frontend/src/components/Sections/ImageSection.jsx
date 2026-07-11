import { Box, Typography } from "@mui/material";

export default function ImageSection({ section }) {
  const image = section.media?.[0]?.url;

  return (
    <Box
      sx={{
        py: 10,
        px: 3,
      }}
    >
      <Typography variant="h3" fontWeight={800} mb={4}>
        {section.title}
      </Typography>

      {image && (
        <Box
          component="img"
          src={image}
          alt={section.title}
          sx={{
            width: "100%",
            maxHeight: 600,
            objectFit: "cover",
            borderRadius: 5,
          }}
        />
      )}
    </Box>
  );
}
