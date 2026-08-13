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
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Link } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";

export default function BookCardGrid({ books }) {
  const { language } = useLanguage();

  const isArabic = language === "ar";

  const text = {
    en: {
      notProvided: "Not provided",
      noDescription: "No description available.",
      noCover: "No cover image",
      price: "Price",
      priceOnRequest: "Price on request",
      viewBook: "View book",
    },

    ar: {
      notProvided: "غير متوفر",
      noDescription: "لا يوجد وصف متاح.",
      noCover: "لا توجد صورة للكتاب",
      price: "السعر",
      priceOnRequest: "السعر عند الطلب",
      viewBook: "عرض الكتاب",
    },
  }[language];

  const formatNumber = (value) => {
    if (value == null) return "";

    return new Intl.NumberFormat(isArabic ? "ar-JO-u-nu-arab" : "en-US").format(
      Number(value),
    );
  };

  return (
    <Box
      dir={isArabic ? "rtl" : "ltr"}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 270px), 1fr))",
        gap: {
          xs: 2.5,
          sm: 3,
          lg: 3.5,
        },
      }}
    >
      {books.map((book) => {
        const title = book.name;
        const description = book.description;
        const category = book.category?.name;

        const authors = book.authors
          ?.map((author) => author.name)
          .filter(Boolean)
          .join("، ");

        return (
          <Card
            key={book.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
              position: "relative",

              border: "1px solid",
              borderColor: "divider",

              transition:
                "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

              "&:hover": {
                transform: "translateY(-6px)",
                borderColor: "primary.light",
                boxShadow: "0 18px 45px rgba(67, 45, 94, 0.14)",
              },

              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",

                "&:hover": {
                  transform: "none",
                },
              },
            }}
          >
            {/* Cover */}
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: "action.hover",
                aspectRatio: "3 / 4",
              }}
            >
              {book.coverImage ? (
                <Box
                  component="img"
                  src={book.coverImage}
                  alt={title || text.noCover}
                  loading="lazy"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",

                    transition: "transform 350ms ease",

                    ".MuiCard-root:hover &": {
                      transform: "scale(1.035)",
                    },

                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    px: 3,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography>{text.noCover}</Typography>
                </Box>
              )}

              {category && (
                <Chip
                  size="small"
                  label={category}
                  sx={{
                    position: "absolute",
                    top: 14,
                    insetInlineStart: 14,

                    bgcolor: "rgba(255,255,255,0.92)",
                    color: "primary.dark",
                    fontWeight: 700,
                    backdropFilter: "blur(10px)",
                  }}
                />
              )}
            </Box>

            <CardContent
              sx={{
                flexGrow: 1,
                p: 2.5,
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 750,
                  lineHeight: 1.45,

                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",

                  minHeight: "2.9em",
                }}
              >
                {title || text.notProvided}
              </Typography>

              {authors && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {authors}
                </Typography>
              )}

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1.5,
                  lineHeight: 1.75,

                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",

                  minHeight: "5.2em",
                }}
              >
                {description || text.noDescription}
              </Typography>

              <Stack
                direction="row"
                alignItems="baseline"
                spacing={0.7}
                sx={{
                  mt: 2,
                }}
              >
                {book.price != null ? (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {text.price}
                    </Typography>

                    <Typography
                      variant="h6"
                      color="primary.main"
                      fontWeight={800}
                    >
                      {formatNumber(book.price)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="subtitle2" color="primary.main">
                    {text.priceOnRequest}
                  </Typography>
                )}
              </Stack>
            </CardContent>

            <CardActions
              sx={{
                px: 2.5,
                pb: 2.5,
                pt: 0,
              }}
            >
              <Button
                component={Link}
                to={`/books/${book.id}`}
                variant="contained"
                fullWidth
                endIcon={
                  isArabic ? (
                    <ArrowBackRoundedIcon />
                  ) : (
                    <ArrowForwardRoundedIcon />
                  )
                }
                sx={{
                  minHeight: 46,
                }}
              >
                {text.viewBook}
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </Box>
  );
}
