import { Box, Typography } from "@mui/material";

export default function ImageTextSection({ section }) {
  const { title, text, img, reverse = false } = section || {};

  if (!section) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          md: reverse ? "row-reverse" : "row",
        },
        alignItems: "center",
        justifyContent: "space-evenly",
        gap: 6,
        py: 8,
        px: 2,
        textAlign: { xs: "center", md: "left" },
      }}
    >
      {/* IMAGE SIDE */}
      {img && (
        <Box
          component="img"
          src={img}
          alt={title || ""}
          loading={section.priority ? "eager" : "lazy"}
          fetchPriority={section.priority ? "high" : "auto"}
          decoding="async"
          sx={{
            width: { xs: "70%", md: "30%" },
            maxWidth: 400,
            aspectRatio: "4 / 3",
            borderRadius: 3,
            transition: "all 0.4s ease",
            filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.25))",
            objectFit: "cover",

            "&:hover": {
              transform: "scale(1.05) rotate(1deg)",
            },
          }}
        />
      )}

      {/* TEXT CARD */}
      <Box
        sx={{
          width: { xs: "90%", md: "40%" },
          p: 5,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",

          background: "linear-gradient(135deg, #613389, #bb40bf)",
          color: "white",

          transition: "all 0.4s ease",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",

          "&:hover": {
            transform: "translateY(-10px) scale(1.02)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          },
        }}
      >
        {/* TITLE */}
        {title && (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            {title}
          </Typography>
        )}

        {/* TEXT */}
        {text && (
          <Typography
            variant="body1"
            sx={{
              opacity: 0.95,
              lineHeight: 1.8,
            }}
          >
            {text}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
