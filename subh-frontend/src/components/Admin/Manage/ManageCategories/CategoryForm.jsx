import { Alert, Box, Button, CircularProgress, Divider, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { uploadCategoryImage } from "../../../../Services/categoryService.js";

const emptyForm = { nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "", image: null };

export default function CategoryForm({ initialCategory, submitLabel, onSubmit, saving }) {
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const initialForm = initialCategory ? {
    nameEn: initialCategory.nameEn || "", nameAr: initialCategory.nameAr || "",
    descriptionEn: initialCategory.descriptionEn || "", descriptionAr: initialCategory.descriptionAr || "", image: initialCategory.image || null,
  } : emptyForm;
  const [form, setForm] = useState(initialForm);
  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrors({ image: "Choose a JPEG, PNG, or WebP image." }); return; }
    try { setUploading(true); setErrors({}); const image = await uploadCategoryImage(file); setForm((current) => ({ ...current, image })); }
    catch (error) { setErrors({ image: error.message }); }
    finally { setUploading(false); }
  };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.nameEn.trim()) nextErrors.nameEn = "English name is required";
    if (!form.nameAr.trim()) nextErrors.nameAr = "Arabic name is required";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    try { setErrors({}); await onSubmit({ ...form, nameEn: form.nameEn.trim(), nameAr: form.nameAr.trim(), descriptionEn: form.descriptionEn.trim() || null, descriptionAr: form.descriptionAr.trim() || null }); }
    catch (error) { setErrors({ _form: error.message, ...error.fieldErrors }); }
  };
  return <Paper component="form" onSubmit={submit} sx={{ p: 3, display: "grid", gap: 2 }}>
    {errors._form && <Alert severity="error">{errors._form}</Alert>}
    <Typography variant="h6">English</Typography>
    <TextField label="Name" required value={form.nameEn} onChange={change("nameEn")} error={!!errors.nameEn} helperText={errors.nameEn} inputProps={{ dir: "ltr", maxLength: 255 }} />
    <TextField label="Description" value={form.descriptionEn} onChange={change("descriptionEn")} multiline minRows={3} inputProps={{ dir: "ltr", maxLength: 1000 }} />
    <Divider />
    <Typography variant="h6" dir="rtl">العربية</Typography>
    <Typography variant="caption" color="text.secondary">Arabic content is recommended, but English text is allowed when needed.</Typography>
    <TextField label="الاسم" required value={form.nameAr} onChange={change("nameAr")} error={!!errors.nameAr} helperText={errors.nameAr} inputProps={{ dir: "rtl", maxLength: 255 }} />
    <TextField label="الوصف" value={form.descriptionAr} onChange={change("descriptionAr")} multiline minRows={3} inputProps={{ dir: "rtl", maxLength: 1000 }} />
    <Divider />
    <Box><Button component="label" variant="outlined" disabled={uploading || saving}>{form.image ? "Replace image" : "Upload image"}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></Button>{uploading && <CircularProgress size={20} sx={{ ml: 2 }} />}{errors.image && <Typography color="error" sx={{ mt: 1 }}>{errors.image}</Typography>}{form.image && <Box component="img" src={form.image} alt="Category preview" sx={{ display: "block", mt: 2, width: 180, height: 120, objectFit: "cover", borderRadius: 1 }} />}</Box>
    <Button type="submit" variant="contained" disabled={saving || uploading}>{saving ? "Saving…" : submitLabel}</Button>
  </Paper>;
}
