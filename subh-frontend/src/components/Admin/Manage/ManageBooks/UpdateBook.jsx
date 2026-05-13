import {
  Button,
  CircularProgress,
  Container,
  Box,
  TextField,
  Typography,
  Divider,
  Paper,
  MenuItem,
} from "@mui/material";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUpload } from "../../../../Hooks/useUpload";
import { useBooks } from "../../../../Hooks/useBooks";
import { useCategories } from "../../../../Hooks/useCategories";

export default function UpdateBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getBook, updateBook, book } = useBooks();
  const { categories } = useCategories();

  const coverUpload = useUpload();
  const barcodeUpload = useUpload();

  const [bookData, setBookData] = useState({
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    author_name_en: "",
    author_name_ar: "",
    category_id: "",
    price: "",
    shipping_cost: "",
    weight_kg: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [barcodeFile, setBarcodeFile] = useState(null);

  const [coverPreview, setCoverPreview] = useState("");
  const [barcodePreview, setBarcodePreview] = useState("");

  const [currentCover, setCurrentCover] = useState("");
  const [currentBarcode, setCurrentBarcode] = useState("");
  useEffect(() => {
    if (id) getBook(id);
  }, [id]);

  // SYNC BOOK → FORM
  useEffect(() => {
    if (!book) return;

    setBookData({
      name_en: book.name_en || "",
      name_ar: book.name_ar || "",
      description_en: book.description_en || "",
      description_ar: book.description_ar || "",
      author_name_en: book.author_name_en || "",
      author_name_ar: book.author_name_ar || "",
      category_id: book.category_id || "",
      price: book.price || "",
      shipping_cost: book.shipping_cost || "",
      weight_kg: book.weight_kg || "",
      length_cm: book.length_cm || "",
      width_cm: book.width_cm || "",
      height_cm: book.height_cm || "",
    });

    setCurrentCover(book.cover_image || "");
    setCurrentBarcode(book.barcode_image || "");
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // COVER
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only images allowed");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCoverUpload = () => {
    if (!coverFile) return toast.error("Select cover image");
    coverUpload.uploadImage(coverFile);
  };

  // BARCODE
  const handleBarcodeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only images allowed");
      return;
    }

    setBarcodeFile(file);
    setBarcodePreview(URL.createObjectURL(file));
  };

  const handleBarcodeUpload = () => {
    if (!barcodeFile) return toast.error("Select barcode image");
    barcodeUpload.uploadImage(barcodeFile);
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!bookData.name_en || !bookData.name_ar) {
      toast.error("Name fields are required");
      return;
    }

    await updateBook(id, {
      ...bookData,
      cover_image: coverUpload.uploadedUrl || currentCover,
      barcode_image: barcodeUpload.uploadedUrl || currentBarcode,
      category_id: Number(bookData.category_id),
      price: Number(bookData.price),
      shipping_cost: Number(bookData.shipping_cost),
      weight_kg: Number(bookData.weight_kg),
      length_cm: Number(bookData.length_cm),
      width_cm: Number(bookData.width_cm),
      height_cm: Number(bookData.height_cm),
    });

    toast.success("Book updated successfully");
    navigate("/admin/books");
  };

  if (!book) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography>Loading book...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
        Update Book
      </Typography>

      <Paper
        sx={{ mt: 3, p: 4, display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* ENGLISH */}
        <Typography fontWeight={700}>English</Typography>

        <TextField
          label="Name (English)"
          name="name_en"
          value={bookData.name_en}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Description (English)"
          name="description_en"
          value={bookData.description_en}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
        />

        <TextField
          label="Author (English)"
          name="author_name_en"
          value={bookData.author_name_en}
          onChange={handleChange}
          fullWidth
        />

        <Divider />

        {/* ARABIC */}
        <Typography fontWeight={700}>العربية</Typography>

        <TextField
          label="الاسم"
          name="name_ar"
          value={bookData.name_ar}
          onChange={handleChange}
          fullWidth
          inputProps={{ dir: "rtl" }}
        />

        <TextField
          label="الوصف"
          name="description_ar"
          value={bookData.description_ar}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
          inputProps={{ dir: "rtl" }}
        />

        <TextField
          label="المؤلف"
          name="author_name_ar"
          value={bookData.author_name_ar}
          onChange={handleChange}
          fullWidth
          inputProps={{ dir: "rtl" }}
        />

        <Divider />

        {/* CATEGORY */}
        <TextField
          select
          label="Category"
          name="category_id"
          value={bookData.category_id}
          onChange={handleChange}
          fullWidth
        >
          {categories?.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name_en} - {cat.name_ar}
            </MenuItem>
          ))}
        </TextField>

        {/* DETAILS */}
        <TextField
          label="Price"
          name="price"
          value={bookData.price}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Shipping Cost"
          name="shipping_cost"
          value={bookData.shipping_cost}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Weight (kg)"
          name="weight_kg"
          value={bookData.weight_kg}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Length (cm)"
          name="length_cm"
          value={bookData.length_cm}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Width (cm)"
          name="width_cm"
          value={bookData.width_cm}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Height (cm)"
          name="height_cm"
          value={bookData.height_cm}
          onChange={handleChange}
          fullWidth
        />

        <Divider />

        {/* COVER */}
        <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 2 }}>
          <Typography fontWeight={600}>Cover Image</Typography>

          {!coverPreview && currentCover && (
            <img src={currentCover} width="120" />
          )}

          <input type="file" onChange={handleCoverChange} />

          {coverPreview && <img src={coverPreview} width="120" />}

          <Button onClick={handleCoverUpload} sx={{ mt: 1 }}>
            Upload Cover
          </Button>

          {coverUpload.loading && <CircularProgress size={18} />}
        </Box>

        {/* BARCODE */}
        <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 2 }}>
          <Typography fontWeight={600}>Barcode Image</Typography>

          {!barcodePreview && currentBarcode && (
            <img src={currentBarcode} width="120" />
          )}

          <input type="file" onChange={handleBarcodeChange} />

          {barcodePreview && <img src={barcodePreview} width="120" />}

          <Button onClick={handleBarcodeUpload} sx={{ mt: 1 }}>
            Upload Barcode
          </Button>

          {barcodeUpload.loading && <CircularProgress size={18} />}
        </Box>

        <Button variant="contained" size="large" onClick={handleUpdate}>
          Save Changes
        </Button>
      </Paper>
    </Container>
  );
}
