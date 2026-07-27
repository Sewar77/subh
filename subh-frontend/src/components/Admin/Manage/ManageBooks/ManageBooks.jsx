import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteBook, getPublicBooks } from "../../../../Services/bookService.js";
import AdminInstructions from "../../AdminInstructions.jsx";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal.jsx";
import TruncatedText from "../../TruncatedText.jsx";

export default function ManageBooks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const [books, setBooks] = useState(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getPublicBooks(categoryId ? { categoryId, limit: 100 } : { limit: 100 })
      .then((response) => active && setBooks(response.books))
      .catch((requestError) => active && setError(requestError.message));
    return () => { active = false; };
  }, [categoryId]);

  const remove = async () => {
    try {
      setDeleting(true);
      await deleteBook(target.id);
      setBooks((current) => current.filter((book) => book.id !== target.id));
      setTarget(null);
      toast.success("Book deleted.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">{categoryId ? "Category books" : "Books"}</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/book/new")}>Add book</Button>
      </Stack>
      <AdminInstructions>Manage bilingual book records and approved images. View opens the complete record, Edit changes permitted book fields, and Delete requires confirmation. Arabic fields may contain English text when needed.</AdminInstructions>
      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}
      {!books ? <CircularProgress /> : books.length === 0 ? <Paper sx={{ p: 3 }}><Typography>No books yet.</Typography></Paper> : (
        <Paper sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead><TableRow><TableCell>#</TableCell><TableCell>Cover</TableCell><TableCell>Title</TableCell><TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Category</TableCell><TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>{books.map((book, index) => <TableRow key={book.id} hover><TableCell>{index + 1}</TableCell><TableCell>{book.coverImage && <Box component="img" src={book.coverImage} alt="" loading="lazy" sx={{ width: 56, height: 44, objectFit: "cover", borderRadius: 1 }} />}</TableCell><TableCell><TruncatedText>{book.nameEn}</TruncatedText><TruncatedText dir="rtl">{book.nameAr}</TruncatedText></TableCell><TableCell sx={{ display: { xs: "none", md: "table-cell" } }}><TruncatedText>{book.category?.nameEn || book.category?.nameAr || "Uncategorized"}</TruncatedText></TableCell><TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : "—"}</TableCell><TableCell><Tooltip title="View details"><IconButton aria-label={`View ${book.nameEn}`} onClick={() => navigate(`/admin/books/${book.id}`)}><VisibilityOutlinedIcon /></IconButton></Tooltip><Tooltip title="Edit book"><IconButton aria-label={`Edit ${book.nameEn}`} onClick={() => navigate(`/admin/book/update/${book.id}`)}><EditOutlinedIcon /></IconButton></Tooltip><Tooltip title="Delete book"><IconButton aria-label={`Delete ${book.nameEn}`} color="error" onClick={() => setTarget(book)}><DeleteOutlineIcon /></IconButton></Tooltip></TableCell></TableRow>)}</TableBody>
          </Table>
        </Paper>
      )}
      <ConfirmDeleteModal open={Boolean(target)} title="Delete book" message={target ? `Delete “${target.nameEn}”? This action cannot be undone.` : ""} loading={deleting} error={error} onCancel={() => setTarget(null)} onConfirm={remove} />
    </Box>
  );
}
