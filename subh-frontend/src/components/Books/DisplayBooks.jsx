import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect } from "react";
import { booksContext } from "../../Context/booksContext";
export default function DisplayBooks() {
  const { loadBooks, books } = useContext(booksContext);
  useEffect(() => {
    loadBooks();
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        justifyContent: "center",
        alignItems: "stretch",
      }}
    >
      {books.map((book) => (
        <Card
          key={book.id}
          sx={{
            width: 280,
            minHeight: 520,
            borderRadius: 3,
            bgcolor: "primary.secondary",
            color: "black",
            display: "flex",
            flexDirection: "column",
            p: 2,
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
              width: "100%",
            }}
          >
            <Tooltip title="Book Cover" arrow>
              <Avatar
                src={book?.cover_image}
                variant="rounded"
                sx={{
                  width: 120,
                  height: 160,
                  borderRadius: 3,
                }}
              />
            </Tooltip>
          </Box>
          <CardContent
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                textAlign: "center",
              }}
            >
              {book?.name_en}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
              }}
            >
              {book?.category_name_en}
            </Typography>
            <Divider sx={{ width: "100%" }} />
            {/* ENGLISH */}
            <Box
              sx={{
                width: "100%",
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                English
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",

                  whiteSpace: "pre-line",
                  wordBreak: "break-word",

                  textAlign: "center",
                }}
              >
                {book?.description_en}
              </Typography>
            </Box>

            {/* ARABIC */}
            <Box
              sx={{
                width: "100%",
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                العربية
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",

                  whiteSpace: "pre-line",
                  wordBreak: "break-word",

                  direction: "rtl",
                  textAlign: "center",
                }}
              >
                {book?.description_ar}
              </Typography>
            </Box>

            <Divider sx={{ width: "100%" }} />

            {/* LESS DETAILS */}
            <Stack
              direction="column"
              sx={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                textAlign: "center",
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Price
                </Typography>

                <Typography fontWeight={700}>${book?.price}</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Author
                </Typography>

                <Typography fontWeight={700}>{book?.author_name_en}</Typography>
              </Box>
            </Stack>
          </CardContent>

          {/* ACTIONS */}
          <CardActions
            sx={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              pt: 0,
            }}
          >
            <Button
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 4,
              }}
            >
              View
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
