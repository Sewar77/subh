import { Grid, Typography, Box } from "@mui/material";

export default function ImageTextSection({ section }) {
  const image = section.media?.[0]?.url;

  return (
    <Grid
      container
      spacing={5}
      alignItems="center"
      sx={{
        py: 10,
        px: 3,
      }}
    >
      <Grid item xs={12} md={6}>
        {image && (
          <Box
            component="img"
            src={image}
            sx={{
              width: "100%",
              borderRadius: 5,
            }}
          />
        )}
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h3" fontWeight={900} mb={3}>
          {section.title}
        </Typography>

        {Object.values(section.content).map((value, index) => (
          <Typography key={index} mb={2} lineHeight={2}>
            {value}
          </Typography>
        ))}
      </Grid>
    </Grid>
  );
}
