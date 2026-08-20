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
import {
  formatCatalogPrice,
  getCatalogCopy,
} from "../../Utils/catalogI18n.js";
import BookCoverImage from "./BookCoverImage.jsx";

export default function BookCardGrid({ books }) {
  const { language } = useLanguage();

  const isArabic = language === "ar";

  const text = getCatalogCopy(language);

  return (
    <Box
      dir={isArabic ? "rtl" : "ltr"}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 330px))",
        justifyContent: "center",
        gap: {
          xs: 2.5,
          sm: 3,
          lg: 3,
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
          .join(isArabic ? "، " : ", ");

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
                transform: "translateY(-4px)",
                borderColor: "primary.light",
                boxShadow: "0 18px 45px rgba(67, 45, 94, 0.14)",
              },

              "&:focus-within": {
                borderColor: "primary.main",
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
            <BookCoverImage
              src={book.coverImage}
              alt={title || text.noCover}
              fallback={text.noCover}
              sx={{
                "& img": { transition: "transform 350ms ease" },
                ".MuiCard-root:hover & img": { transform: "scale(1.035)" },
                "@media (prefers-reduced-motion: reduce)": {
                  "& img": { transition: "none" },
                },
              }}
            >
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
            </BookCoverImage>

            <CardContent
              sx={{
                flexGrow: 1,
                p: 2.25,
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

                  minHeight: "2.8em",
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
                  mt: 1.1,
                  lineHeight: 1.65,

                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",

                  minHeight: "3.3em",
                }}
              >
                {description || text.noDescription}
              </Typography>

              <Stack
                direction="row"
                alignItems="baseline"
                spacing={0.7}
                sx={{
                  mt: 1.5,
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
                      {formatCatalogPrice(book.price, language)}
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
                px: 2.25,
                pb: 2.25,
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
                  minHeight: 42,
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
