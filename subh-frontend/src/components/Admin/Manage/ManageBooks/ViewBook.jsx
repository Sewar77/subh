import { Alert, Box, CircularProgress, Container, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteBook, getAdminBook } from "../../../../Services/bookService.js";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal.jsx";
import BookCoverImage from "../../../Books/BookCoverImage.jsx";

const Detail = ({ label, value, dir }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
    <Typography dir={dir} sx={{ mt: 0.35, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{value ?? "—"}</Typography>
  </Box>
);

export default function ViewBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminBook(id).then((item) => active && setBook(item)).catch((requestError) => active && setError(requestError.status === 404 ? "The selected book could not be found." : requestError.message));
    return () => { active = false; };
  }, [id]);

  const remove = async () => {
    try {
      setDeleting(true);
      await deleteBook(id);
      toast.success("Book deleted.");
      navigate("/admin/books");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  if (error && !book) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!book) return <Container sx={{ py: 6, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading book details...</Typography></Container>;

  const authors = book.authors?.map((author) => author.nameEn || author.nameAr).join(", ") || "—";
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={1.5}>
          <Box><Typography variant="h4" component="h1">Book details</Typography><Typography color="text.secondary">Review the catalog record and its localized content.</Typography></Box>
          <Stack direction="row" alignSelf={{ xs: "flex-end", sm: "center" }}>
            <Tooltip title="Edit book"><IconButton size="small" aria-label="Edit book" onClick={() => navigate(`/admin/book/update/${id}`)}><EditOutlinedIcon /></IconButton></Tooltip>
            <Tooltip title="Delete book"><IconButton size="small" aria-label="Delete book" color="error" onClick={() => setConfirmOpen(true)}><DeleteOutlineIcon /></IconButton></Tooltip>
          </Stack>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px minmax(0,1fr)" }, gap: { xs: 2.5, md: 3.5 }, alignItems: "start" }}>
            <BookCoverImage src={book.coverImage} alt={book.nameEn} fallback="No cover image" variant="adminDetail" sx={{ width: "100%", maxWidth: 220, mx: { xs: "auto", md: 0 } }} />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 2.25 }}>
              <Detail label="English title" value={book.nameEn} />
              <Detail label="Arabic title" value={book.nameAr} dir="rtl" />
              <Detail label="English description" value={book.descriptionEn} />
              <Detail label="Arabic description" value={book.descriptionAr} dir="rtl" />
              <Detail label="Category" value={book.category?.nameEn || book.category?.nameAr || "Uncategorized"} />
              <Detail label="Authors" value={authors} />
              <Detail label="ISBN" value={book.isbn} />
              <Detail label="Price" value={book.price} />
              <Detail label="Created" value={book.createdAt && new Date(book.createdAt).toLocaleString()} />
            </Box>
          </Box>
        </Paper>
      </Stack>
      <ConfirmDeleteModal open={confirmOpen} title="Delete book" message={`Delete “${book.nameEn}”? This action cannot be undone.`} loading={deleting} error={error} onCancel={() => setConfirmOpen(false)} onConfirm={remove} />
    </Container>
  );
}
