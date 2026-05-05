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
          <Avatar
            src={book?.barcode_image}
            variant="rounded"
            sx={{
              width: 200,
              height: 200,
              objectFit: "contain",
              borderRadius: 6,
            }}
          />

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
          {/* EXTRA DETAILS GRID */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              width: "100%",
              textAlign: "left",
              alignContent: "center",
            }}
          >
            <Typography>
              <b>ID:</b> {book?.id}
            </Typography>

            <Typography>
              <b>Category Name:</b> {book?.category_name_ar}
            </Typography>
            <Typography>
              <b>Category Name:</b> {book?.category_name_en}
            </Typography>

            <Typography>
              <b>Price:</b> ${book?.price}
            </Typography>

            <Typography>
              <b>Shipping Cost:</b> ${book?.shipping_cost}
            </Typography>

            <Typography>
              <b>Weight:</b> {book?.weight_kg} kg
            </Typography>

            <Typography>
              <b>Dimensions:</b> {book.length_cm} × {book?.width_cm} ×{" "}
              {book?.height_cm} cm
            </Typography>

            <Typography>
              <b>Created:</b> {new Date(book?.created_at).toLocaleString()}
            </Typography>
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
