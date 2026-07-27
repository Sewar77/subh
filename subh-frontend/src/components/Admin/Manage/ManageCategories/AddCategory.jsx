import { Container, Typography } from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../../../Hooks/useCategories.js";
import CategoryForm from "./CategoryForm.jsx";
export default function AddCategory() {
  const { createCategories } = useCategories(); const [saving, setSaving] = useState(false); const navigate = useNavigate();
  const submit = async (payload) => { setSaving(true); try { await createCategories(payload); toast.success("Category created"); navigate("/admin/categories"); } finally { setSaving(false); } };
  return <Container maxWidth="md"><Typography variant="h4" sx={{ my: 3 }}>Add category</Typography><CategoryForm submitLabel="Create category" onSubmit={submit} saving={saving} /></Container>;
}
