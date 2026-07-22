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
        alt={section.title || "media"}
        sx={{
          maxWidth: "100%",
          borderRadius: 3,
        }}
      />
    </Box>
  );
}
