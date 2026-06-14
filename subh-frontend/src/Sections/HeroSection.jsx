import { Box, Typography } from "@mui/material";

export default function HeroSection({ section }) {
  return (
    <Box py={8}>
      <Typography variant="h2">Hero Section</Typography>

      <pre>{JSON.stringify(section, null, 2)}</pre>
    </Box>
  );
}
