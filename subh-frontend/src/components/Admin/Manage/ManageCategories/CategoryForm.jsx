import { Alert, Button, Divider, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import MediaPicker from "../../Media/MediaPicker.jsx";

const emptyForm = { nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "", image: null };

export default function CategoryForm({ initialCategory, submitLabel, onSubmit, saving }) {
  const [errors, setErrors] = useState({});
  const initialForm = initialCategory ? {
    nameEn: initialCategory.nameEn || "", nameAr: initialCategory.nameAr || "",
    descriptionEn: initialCategory.descriptionEn || "", descriptionAr: initialCategory.descriptionAr || "", image: initialCategory.image || null,
  } : emptyForm;
  const [form, setForm] = useState(initialForm);
  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
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
    <MediaPicker value={form.image ? { url: form.image } : null} disabled={saving} uploadLabel="Upload image" replaceLabel="Replace image" libraryLabel="Choose from Media Library" onSelect={(asset) => setForm((current) => ({ ...current, image: asset.url }))} />
    {errors.image && <Typography color="error">{errors.image}</Typography>}
    <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving…" : submitLabel}</Button>
  </Paper>;
}
