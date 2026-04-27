import { Button, Box, Typography } from "@mui/material";

export default function Questions() {
  return (
    <>
      <Box
        sx={{
          textAlign: "center",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            position: "relative",
            display: "inline-block",
            fontWeight: 700,
            "&::after": {
              mx: "auto",
              content: '""',
              position: "absolute",
              left: 0,
              bottom: -6,
              width: "100%",
              height: "4px",
              borderRadius: "4px",
              background: "linear-gradient(90deg, #bb40bf, #613389, #102943 )",
            },
          }}
        >
          Do You Hvae a Question?
        </Typography>
        <Typography variant="h5">Feel Free to Reach out</Typography>
        <Button
          variant="contained"
          sx={{
            width: "200px",
            background: `linear-gradient(45deg, rgb(0, 255, 255), rgb(255, 0, 255))`,
            color: "#fff",
            fontWeight: 600,
            borderRadius: 3,
            textTransform: "none",
            display: { xs: "none", sm: "flex" },
            "&:hover": {
              background: `linear-gradient(90deg,  rgb(255, 0, 255),#613389)`,
            },
          }}
        >
          Contact Now
        </Button>
      </Box>
    </>
  );
}
