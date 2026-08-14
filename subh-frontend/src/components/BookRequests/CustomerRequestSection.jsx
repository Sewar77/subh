import { Paper, Typography } from "@mui/material";

export default function CustomerRequestSection({ title, children }) {
  return (
    <Paper component="section" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
      <Typography component="h2" variant="h5" color="primary.main" fontWeight={800} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
