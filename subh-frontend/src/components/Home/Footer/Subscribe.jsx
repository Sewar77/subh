import { Box, Button, FormControl, TextField, Typography } from "@mui/material";

export default function Subscribe() {
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
          Subscribe to newsletter
        </Typography>
        <Typography variant="body2">Get the Latest News</Typography>
        <FormControl
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            mx: "auto",
            mt: 2,
          }}
        >
          <TextField
            label="Your Email"
            sx={{
              bgcolor: "primary.secondary",
              borderRadius: 1,
              color: "success.main",
            }}
          />
          <Button type="submit" variant="contained">
            Send
          </Button>
        </FormControl>
      </Box>
    </>
  );
}
