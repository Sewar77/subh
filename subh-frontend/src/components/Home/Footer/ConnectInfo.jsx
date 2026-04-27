import { Box, Typography } from "@mui/material";

export default function ConnectInfo() {
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
          Stay Connected
        </Typography>
        <Typography variant="body2">contact@subh.com</Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          +1-215456-7890
        </Typography>
      </Box>
    </>
  );
}
