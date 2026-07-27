import { CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useCategories } from "../../../../Hooks/useCategories.js";
import { getCategory as getCategoryById } from "../../../../Services/categoryService.js";
import CategoryForm from "./CategoryForm.jsx";
export default function UpdateCategory() {
  const { id } = useParams(); const { updateCategory } = useCategories(); const [category, setCategory] = useState(null); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const navigate = useNavigate();
  useEffect(() => { getCategoryById(id).then(setCategory).catch((requestError) => setError(requestError.message)); }, [id]);
  const submit = async (payload) => { setSaving(true); try { await updateCategory(id, payload); toast.success("Category updated"); navigate("/admin/categories"); } finally { setSaving(false); } };
  if (error) return <Container sx={{ mt: 4 }}><Typography color="error">{error}</Typography></Container>;
  if (!category?.id || String(category.id) !== String(id)) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>;
  return <Container maxWidth="md"><Typography variant="h4" sx={{ my: 3 }}>Edit category</Typography><CategoryForm key={category.id} initialCategory={category} submitLabel="Save changes" onSubmit={submit} saving={saving} /></Container>;
}
