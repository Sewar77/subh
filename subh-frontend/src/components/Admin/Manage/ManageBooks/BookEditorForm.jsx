import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useCategories } from "../../../../Hooks/useCategories.js";
import { uploadBookImage } from "../../../../Services/bookService.js";

const emptyBook = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  categoryId: "",
  price: "",
  isbn: "",
  shippingCost: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  coverImage: "",
  barcodeImage: "",
};

const toFormValue = (book = {}) =>
  Object.fromEntries(
    Object.keys(emptyBook).map((key) => [
      key,
      book[key] === null || book[key] === undefined ? "" : book[key],
    ]),
  );

const optionalNumber = (value) => (value === "" ? null : Number(value));

const toPayload = (values) => ({
  nameEn: values.nameEn.trim(),
  nameAr: values.nameAr.trim(),
  descriptionEn: values.descriptionEn.trim() || null,
  descriptionAr: values.descriptionAr.trim() || null,
  categoryId: optionalNumber(values.categoryId),
  price: Number(values.price),
  isbn: values.isbn.trim(),
  shippingCost: optionalNumber(values.shippingCost),
  weightKg: Number(values.weightKg),
  lengthCm: optionalNumber(values.lengthCm),
  widthCm: optionalNumber(values.widthCm),
  heightCm: optionalNumber(values.heightCm),
  coverImage: values.coverImage.trim() || null,
  barcodeImage: values.barcodeImage.trim() || null,
});

function ImageField({ label, value, onChange }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const selectFile = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose an image file for this field.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setError("");
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const upload = async () => {
    if (!file) {
      setError("Choose an image before uploading.");
      return;
    }
    try {
      setUploading(true);
      setError("");
      onChange(await uploadBookImage(file));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography fontWeight={700}>{label}</Typography>
      {(preview || value) && (
        <Box
          component="img"
          src={preview || value}
          alt={`${label} preview`}
          loading="lazy"
          sx={{ display: "block", width: 144, height: 112, objectFit: "cover", borderRadius: 1, my: 1.5 }}
        />
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
        <Button component="label" variant="outlined">
          Choose image
          <input hidden accept="image/*" type="file" onChange={selectFile} />
        </Button>
        <Button variant="contained" onClick={upload} disabled={!file || uploading}>
          {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
        </Button>
        {uploading && <CircularProgress size={22} aria-label={`Uploading ${label}`} />}
      </Stack>
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </Paper>
  );
}

export default function BookEditorForm({ initialBook, submitLabel, onSubmit, saving }) {
  const { categories } = useCategories();
  const [values, setValues] = useState(() => toFormValue(initialBook));
  const [error, setError] = useState("");

  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!values.nameEn.trim() || !values.nameAr.trim()) {
      setError("English and Arabic book titles are required.");
      return;
    }
    if (!values.isbn.trim() || !values.price || values.weightKg === "") {
      setError("ISBN, price, and weight are required.");
      return;
    }
    try {
      setError("");
      await onSubmit(toPayload(values));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <Paper component="form" onSubmit={submit} sx={{ mt: 3, p: { xs: 2, md: 4 } }}>
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography fontWeight={700}>English information</Typography>
        <TextField label="Book title" name="nameEn" value={values.nameEn} onChange={change} required fullWidth />
        <TextField label="Description" name="descriptionEn" value={values.descriptionEn} onChange={change} multiline rows={4} fullWidth />
        <Divider />
        <Typography fontWeight={700}>Arabic information</Typography>
        <Typography variant="caption" color="text.secondary">Arabic content is recommended, but English text is allowed when needed.</Typography>
        <TextField label="Arabic book title" name="nameAr" value={values.nameAr} onChange={change} inputProps={{ dir: "rtl" }} required fullWidth />
        <TextField label="Arabic description" name="descriptionAr" value={values.descriptionAr} onChange={change} inputProps={{ dir: "rtl" }} multiline rows={4} fullWidth />
        <Divider />
        <TextField select label="Category" name="categoryId" value={values.categoryId} onChange={change} fullWidth>
          <MenuItem value="">No category</MenuItem>
          {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.nameEn} — {category.nameAr}</MenuItem>)}
        </TextField>
        <TextField label="ISBN" name="isbn" value={values.isbn} onChange={change} required fullWidth />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField label="Price" name="price" type="number" inputProps={{ min: 0, step: "0.01" }} value={values.price} onChange={change} required fullWidth />
          <TextField label="Weight (kg)" name="weightKg" type="number" inputProps={{ min: 0, step: "0.01" }} value={values.weightKg} onChange={change} required fullWidth />
          <TextField label="Shipping cost" name="shippingCost" type="number" inputProps={{ min: 0, step: "0.01" }} value={values.shippingCost} onChange={change} fullWidth />
          <TextField label="Length (cm)" name="lengthCm" type="number" inputProps={{ min: 0, step: "0.01" }} value={values.lengthCm} onChange={change} fullWidth />
          <TextField label="Width (cm)" name="widthCm" type="number" inputProps={{ min: 0, step: "0.01" }} value={values.widthCm} onChange={change} fullWidth />
          <TextField label="Height (cm)" name="heightCm" type="number" inputProps={{ min: 0, step: "0.01" }} value={values.heightCm} onChange={change} fullWidth />
        </Box>
        <ImageField label="Cover image" value={values.coverImage} onChange={(coverImage) => setValues((current) => ({ ...current, coverImage }))} />
        <ImageField label="Barcode image" value={values.barcodeImage} onChange={(barcodeImage) => setValues((current) => ({ ...current, barcodeImage }))} />
        <Button type="submit" variant="contained" size="large" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </Stack>
    </Paper>
  );
}
