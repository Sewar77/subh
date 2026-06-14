import { Box } from "@mui/material";

export default function ImageSection({ section }) {
  const imageUrl = section?.image_url;

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
        alt=""
        sx={{
          width: "100%",
          maxWidth: "1200px",
          height: "auto",
          borderRadius: 4,
          display: "block",
          objectFit: "cover",
          boxShadow: 3,
        }}
      />
    </Box>
  );
}
