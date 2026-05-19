import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Divider,
  Grid,
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
  console.log(books);
  return (
    <Grid
      container
      spacing={3}
      sx={{
        justifyContent: "center",
      }}
    >
      {books.map((book) => (
        <Grid
          xs={12}
          sm={12}
          md={6}
          key={book.id}
          sx={{
            display: "flex",
            width: 350,
            height: "600",
          }}
        >
          <Card
            sx={{
              width: "100%",
              minHeight: 600,
              borderRadius: 3,
              bgcolor: "primary.secondary",
              color: "black",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              p: 2,
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <CardHeader
              title={"ISBN: " + book.isbn}
              slotProps={{
                title: {
                  sx: {
                    fontSize: "14px",
                    fontWeight: 900,
                  },
                },
              }}
            />

            <CardMedia
              component="img"
              src={book.cover_image}
              sx={{
                width: 250,
                height: 250,
                borderRadius: 2,
                objectFit: "cover",
              }}
            />

            <CardContent
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
              }}
            >
              <Typography sx={{ my: 3 }}>
                <b>Name:</b>
                <br />
                {book.name_en} || {book.name_ar}
              </Typography>

              <Typography
                sx={{
                  my: 3,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                }}
              >
                <b>Category:</b>
                <br />
                {book.category_name_en} - {book.category_name_ar}
              </Typography>

              <Box sx={{ mt: "auto" }}>
                <Typography
                  sx={{
                    mt: 3,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                  }}
                >
                  <b>Price:</b>
                </Typography>
                <Chip
                  label={`$ ${book.price}`}
                  size="large"
                  sx={{
                    p: 2,
                    mt: 1,
                    bgcolor: "background.paper",
                    color: "primary.secondary",
                  }}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button variant="contained">View</Button>
              <Button variant="contained">Request</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
