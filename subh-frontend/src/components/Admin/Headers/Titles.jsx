import { Typography } from "@mui/material";

export default function Title({ title, caption }) {
  return (
    <>
      <Typography variant="h3" sx={{ fontSize: "2.6rem", fontWeight: 800 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ my: 2, fontSize: "1.1rem" }}
      >
        {caption}
      </Typography>
    </>
  );
}
