import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  const name = category.name;
  const description = category.description;
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 34px rgba(7, 26, 53, .16)",
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      {category.image ? (
        <Box
          component="img"
          src={category.image}
          alt={name || "Category"}
          loading="lazy"
          sx={{
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            bgcolor: "action.hover",
          }}
        />
      ) : (
        <Box
          sx={{
            aspectRatio: "16 / 9",
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          No image
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography variant="h6" component="h2">
          {name || "Untitled category"}
        </Typography>
        <Chip
          size="small"
          label={`${category.bookCount ?? 0} book${category.bookCount === 1 ? "" : "s"}`}
          sx={{ mt: 1, bgcolor: "rgba(163,76,168,.12)", color: "primary.main" }}
        />
        <Typography
          color="text.secondary"
          sx={{
            mt: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description || "No description available."}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1 }}>
        <Button
          component={Link}
          to={`/categories/${category.id}`}
          variant="outlined"
          fullWidth
        >
          Details
        </Button>
        <Button
          component={Link}
          to={`/categories/${category.id}/books`}
          variant="contained"
          fullWidth
        >
          View books
        </Button>
      </CardActions>
    </Card>
  );
}
