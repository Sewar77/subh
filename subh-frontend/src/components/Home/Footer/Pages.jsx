import { Box, Typography } from "@mui/material";

export default function Pages() {
  return (
    <>
      <Box>
        <Typography
          variant="h6"
          sx={{
            position: "relative",
            display: "inline-block",
            fontWeight: 700,
            mb: 2,
            "&::after": {
              mx: "auto",
              content: '""',
              position: "absolute",
              left: 0,
              bottom: -6,
              width: "100%",
              height: "4px",
              borderRadius: "4px",
              background: "linear-gradient(90deg, #41f2c3, #102943 )",
            },
          }}
        >
          Pages
        </Typography>
        <Typography>Home</Typography>
        <Typography>Educational Programs</Typography>
        <Typography>Learning Recourses</Typography>
        <Typography>WorkShops</Typography>
        <Typography>About Us</Typography>
        <Typography>Contact Us</Typography>
      </Box>
    </>
  );
}
