import { Grid, Typography } from "@mui/material";

export default function ImageTextSection({ section }) {
  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={12} md={6}>
        <img
          src={section.content.image}
          alt={section.title}
          style={{ width: "100%", borderRadius: 8 }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h4" gutterBottom>
          {section.title}
        </Typography>

        <Typography>{section.content.text}</Typography>
      </Grid>
    </Grid>
  );
}
