import { Box } from "@mui/material";

export default function MediaSection({ section }) {
  if (!section) return null;

  const media =
    section.content?.image ||
    section.content?.video ||
    section.content?.logo ||
    section.content?.notes ||
    section.content?.theme_image;

  if (!media) return null;

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
        src={media}
        alt={section.title || ""}
        loading={section.priority ? "eager" : "lazy"}
        fetchPriority={section.priority ? "high" : "auto"}
        decoding="async"
        sx={{
          width: "100%",
          maxWidth: "100%",
          aspectRatio: "16 / 9",
          objectFit: "contain",
          bgcolor: "action.hover",
          borderRadius: 3,
        }}
      />
    </Box>
  );
}
