import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import {
  formatCatalogNumber,
  getCatalogCountLabel,
  getCatalogCopy,
} from "../../Utils/catalogI18n.js";

export default function CategoryCard({ category }) {
  const { language } = useLanguage();
  const t = getCatalogCopy(language);
  const isArabic = language === "ar";
  const name = category.name || t.category;
  const bookCount = category.bookCount ?? 0;

  return (
    <Card
      dir={isArabic ? "rtl" : "ltr"}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 34px rgba(7, 26, 53, .16)",
        },
        "&:focus-within": {
          borderColor: "primary.main",
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <Box sx={{ aspectRatio: "16 / 9", bgcolor: "action.hover" }}>
        {category.image ? (
          <Box
            component="img"
            src={category.image}
            alt={name}
            loading="lazy"
            decoding="async"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              px: 2,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            {t.noImage}
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.25 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 750,
            minHeight: "2.8em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {name}
        </Typography>
        <Chip
          size="small"
          label={`${formatCatalogNumber(bookCount, language)} ${getCatalogCountLabel("books", bookCount, language)}`}
          sx={{ mt: 1, bgcolor: "rgba(163,76,168,.12)", color: "primary.main" }}
        />
        <Typography
          color="text.secondary"
          sx={{
            mt: 1.1,
            minHeight: "3.4em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {category.description || t.noDescription}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2.25, pb: 2.25, pt: 0 }}>
        <Stack direction="row" spacing={1} width="100%">
          <Button
            component={Link}
            to={`/categories/${category.id}`}
            variant="outlined"
            fullWidth
            sx={{ minHeight: 42, px: 1.25 }}
          >
            {t.details}
          </Button>
          <Button
            component={Link}
            to={`/categories/${category.id}/books`}
            variant="contained"
            fullWidth
            endIcon={isArabic ? <ArrowBackRoundedIcon /> : <ArrowForwardRoundedIcon />}
            sx={{ minHeight: 42, px: 1.25 }}
          >
            {t.viewBooks}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
