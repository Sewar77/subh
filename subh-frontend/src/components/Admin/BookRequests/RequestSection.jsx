import { Box, Paper, Stack, Typography } from "@mui/material";

export default function RequestSection({ title, description, action, children, sx }) {
  return (
    <Paper component="section" sx={{ p: { xs: 2, md: 3 }, minWidth: 0, ...sx }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5">{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}
