import { useNavigate, useParams } from "react-router-dom";
import { useBooks } from "../../../../Hooks/useBooks";
import { useEffect } from "react";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
  Stack,
  Box,
  Divider,
  Paper,
  Tooltip,
} from "@mui/material";
import UpdateBtn from "../../Buttons/UpdateBtn.jsx";
import DeleteButton from "../../Buttons/DeleteBtn.jsx";
export default function ViewBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, getBook, deleteBook } = useBooks();
  console.log(book);
  const handleUpdate = (id) => navigate(`/admin/book/update/${id}`);
  const handleDelete = (id) => {
    deleteBook(id);
    navigate("/admin/books");
  };

  useEffect(() => {
    if (id) getBook(id);
  }, [id]);
  return (
    <Container sx={{ my: 5 }}>
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={3} sx={{ alignItems: "center" }}>
          {/* TITLE */}
          <Typography variant="h3">Book: {book?.name_en}</Typography>

          <Divider sx={{ width: "100%" }} />

          {/* IMAGE */}
          <Tooltip describeChild title="cover book" arrow>
            <Avatar
              src={book?.cover_image}
              variant="rounded"
              sx={{
                width: 200,
                height: 200,
                objectFit: "contain",
                borderRadius: 6,
              }}
            />
          </Tooltip>
          {/* MAIN INFO */}
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 6,
              textAlign: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            {/* ENGLISH */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ my: 4 }}>
                English
              </Typography>

              <Typography variant="h4">{book?.name_en}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                {book?.description_en}
              </Typography>
            </Box>

            <Box
              sx={{
                width: { xs: "60%", sm: "60%", md: "1px" },
                height: { xs: "1px", sm: "1px", md: "40px" },
                bgcolor: "text.secondary",
                mx: { md: 2 },
                my: { xs: 2, md: 0 },
              }}
            />
            {/* ARABIC */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ my: 4 }}>
                العربية
              </Typography>

              <Typography variant="h4" sx={{ direction: "rtl" }}>
                {book?.name_ar}
              </Typography>

              <Typography variant="h6" sx={{ mt: 2, direction: "rtl" }}>
                {book?.description_ar}
              </Typography>
            </Box>
          </CardContent>

          <Divider sx={{ width: "100%" }} />
          <Typography variant="h6">Extra Book Details</Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
              mt: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Book ID
              </Typography>

              <Typography fontWeight={700}>#{book?.id}</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Author Name (EN)
              </Typography>

              <Typography fontWeight={700}>{book?.author_name_en}</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                اسم المؤلف
              </Typography>

              <Typography fontWeight={700}>{book?.author_name_ar}</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Category (EN)
              </Typography>

              <Typography fontWeight={700}>{book?.category_name_en}</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                التصنيف
              </Typography>

              <Typography fontWeight={700}>{book?.category_name_ar}</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Price
              </Typography>

              <Typography fontWeight={700}>${book?.price}</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Shipping Cost
              </Typography>

              <Typography fontWeight={700}>${book?.shipping_cost}</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Weight
              </Typography>

              <Typography fontWeight={700}>{book?.weight_kg} kg</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Dimensions
              </Typography>

              <Typography fontWeight={700}>
                {book?.length_cm} × {book?.width_cm} × {book?.height_cm} cm
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Created At
              </Typography>

              <Typography fontWeight={700}>
                {new Date(book?.created_at).toLocaleString()}
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ width: "100%" }} />
          {/* ACTIONS */}
          <CardActions>
            <UpdateBtn onClick={() => handleUpdate(book.id)} />
            <DeleteButton onClick={() => handleDelete(book.id)} />
          </CardActions>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
