import { Alert, Box, CircularProgress, Container, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteBook, getAdminBook } from "../../../../Services/bookService.js";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal.jsx";

const Detail = ({ label, value, dir }) => <Box><Typography variant="subtitle2" color="text.secondary">{label}</Typography><Typography dir={dir} sx={{ whiteSpace: "pre-wrap" }}>{value ?? "—"}</Typography></Box>;

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
  return <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}><Stack spacing={2}><Stack direction="row" justifyContent="flex-end"><Tooltip title="Edit book"><IconButton aria-label="Edit book" onClick={() => navigate(`/admin/book/update/${id}`)}><EditOutlinedIcon /></IconButton></Tooltip><Tooltip title="Delete book"><IconButton aria-label="Delete book" color="error" onClick={() => setConfirmOpen(true)}><DeleteOutlineIcon /></IconButton></Tooltip></Stack>{error && <Alert severity="error">{error}</Alert>}<Paper sx={{ p: { xs: 2, md: 4 } }}><Typography variant="h4">Book details</Typography>{book.coverImage && <Box component="img" src={book.coverImage} alt={book.nameEn} loading="lazy" sx={{ width: "100%", maxHeight: 320, objectFit: "contain", my: 2 }} />}<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}><Detail label="English title" value={book.nameEn} /><Detail label="Arabic title" value={book.nameAr} dir="rtl" /><Detail label="English description" value={book.descriptionEn} /><Detail label="Arabic description" value={book.descriptionAr} dir="rtl" /><Detail label="Category" value={book.category?.nameEn || book.category?.nameAr || "Uncategorized"} /><Detail label="Authors" value={authors} /><Detail label="ISBN" value={book.isbn} /><Detail label="Price" value={book.price} /><Detail label="Created" value={book.createdAt && new Date(book.createdAt).toLocaleString()} /></Box></Paper></Stack><ConfirmDeleteModal open={confirmOpen} title="Delete book" message={`Delete “${book.nameEn}”? This action cannot be undone.`} loading={deleting} error={error} onCancel={() => setConfirmOpen(false)} onConfirm={remove} /></Container>;
}
