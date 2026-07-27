import { Alert, CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPublicBook, updateBook } from "../../../../Services/bookService.js";
import BookEditorForm from "./BookEditorForm.jsx";

export default function UpdateBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getPublicBook(id)
      .then((item) => active && setBook(item))
      .catch((requestError) => active && setError(requestError.status === 404 ? "The selected book could not be found." : requestError.message));
    return () => { active = false; };
  }, [id]);

  const save = async (payload) => {
    try {
      setSaving(true);
      const updated = await updateBook(id, payload);
      setBook(updated);
      toast.success("Book updated.");
      navigate("/admin/books");
    } finally {
      setSaving(false);
    }
  };

  if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!book) return <Container sx={{ py: 6, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading book details...</Typography></Container>;
  return <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}><Typography variant="h4" fontWeight={700}>Edit book</Typography><BookEditorForm key={book.id} initialBook={book} submitLabel="Save changes" onSubmit={save} saving={saving} /></Container>;
}
