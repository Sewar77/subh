import { Container, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createBook } from "../../../../Services/bookService.js";
import BookEditorForm from "./BookEditorForm.jsx";

export default function AddBook() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const create = async (payload) => {
    try {
      setSaving(true);
      await createBook(payload);
      toast.success("Book created.");
      navigate("/admin/books");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700}>Add book</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>Create a bilingual book record. Titles, ISBN, price, and weight are required.</Typography>
      <BookEditorForm submitLabel="Create book" onSubmit={create} saving={saving} />
    </Container>
  );
}
