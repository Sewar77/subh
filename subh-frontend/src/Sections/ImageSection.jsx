import { Box } from "@mui/material";

export default function ImageSection({ section }) {
  const imageUrl = section.content.image;
  if (!imageUrl) return null;
  return (
    <Box
      sx={{
        py: 6,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        component="img"
        src={imageUrl}
        alt={section.content.alt || section.title || ""}
        loading={section.priority ? "eager" : "lazy"}
        fetchPriority={section.priority ? "high" : "auto"}
        decoding="async"
        sx={{
          width: "100%",
          maxWidth: "1200px",
          aspectRatio: "16 / 9",
          borderRadius: 4,
          display: "block",
          objectFit: "contain",
          bgcolor: "action.hover",
          boxShadow: 3,
        }}
      />
    </Box>
  );
}
