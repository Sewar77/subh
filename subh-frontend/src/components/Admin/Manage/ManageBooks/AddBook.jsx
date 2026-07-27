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
import { useState } from "react";
import { useUpload } from "../../../../Hooks/useUpload";
import { useBooks } from "../../../../Hooks/useBooks";
import { useCategories } from "../../../../Hooks/useCategories";

export default function AddBook() {
  const { createBooks } = useBooks();
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
    isbn: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateImage = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return false;
    }

    return true;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!validateImage(file)) return;

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleBarcodeChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!validateImage(file)) return;

    setBarcodeFile(file);
    setBarcodePreview(URL.createObjectURL(file));
  };

  const handleCoverUpload = async () => {
    if (!coverFile) {
      toast.error("Select cover image first");
      return;
    }

    await coverUpload.uploadImage(coverFile);
  };

  const handleBarcodeUpload = async () => {
    if (!barcodeFile) {
      toast.error("Select barcode image first");
      return;
    }

    await barcodeUpload.uploadImage(barcodeFile);
  };

  const handleSubmit = async () => {
    if (!coverUpload.uploadedUrl) {
      toast.error("Upload cover image");
      return;
    }

    if (!barcodeUpload.uploadedUrl) {
      toast.error("Upload barcode image");
      return;
    }

    if (
      !bookData.name_en ||
      !bookData.name_ar ||
      !bookData.author_name_en ||
      !bookData.author_name_ar ||
      !bookData.category_id ||
      !bookData.price ||
      !bookData.isbn
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      ...bookData,
      category_id: Number(bookData.category_id),
      price: Number(bookData.price),
      isbn: bookData.isbn,
      shipping_cost: Number(bookData.shipping_cost || 0),
      weight_kg: Number(bookData.weight_kg || 0),
      length_cm: Number(bookData.length_cm || 0),
      width_cm: Number(bookData.width_cm || 0),
      height_cm: Number(bookData.height_cm || 0),
      cover_image: coverUpload.uploadedUrl,

      barcode_image: barcodeUpload.uploadedUrl,
    };

    await createBooks(payload);

    // resetForm();
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        sx={{
          mt: 4,
          fontWeight: 700,
        }}
      >
        Add Book
      </Typography>

      <Paper
        sx={{
          mt: 3,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography fontWeight={700}>English Information</Typography>

        <TextField
          label="Book Name"
          name="name_en"
          value={bookData.name_en}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Description"
          name="description_en"
          value={bookData.description_en}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
        />

        <TextField
          label="Author Name"
          name="author_name_en"
          value={bookData.author_name_en}
          onChange={handleChange}
          fullWidth
        />

        <Divider />

        <Typography fontWeight={700}>المعلومات العربية</Typography>
        <Typography variant="caption" color="text.secondary">Arabic content is recommended, but English text is allowed when needed.</Typography>

        <TextField
          label="اسم الكتاب"
          name="name_ar"
          value={bookData.name_ar}
          onChange={handleChange}
          fullWidth
          inputprops={{ dir: "rtl" }}
        />

        <TextField
          label="الوصف"
          name="description_ar"
          value={bookData.description_ar}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          inputprops={{ dir: "rtl" }}
        />

        <TextField
          label="اسم المؤلف"
          name="author_name_ar"
          value={bookData.author_name_ar}
          onChange={handleChange}
          fullWidth
          inputprops={{ dir: "rtl" }}
        />

        <Divider />

        <TextField
          select
          label="Category"
          name="category_id"
          value={bookData.category_id}
          onChange={handleChange}
          fullWidth
        >
          {categories?.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name_en} - {category.name_ar}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="ISBN"
          name="isbn"
          value={bookData.isbn}
          onChange={handleChange}
          fullWidth
        />

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

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px dashed #ccc",
              borderRadius: 3,
              width: 320,
            }}
          >
            <Typography fontWeight={700}>Cover Image</Typography>

            <Box sx={{ mt: 2 }}>
              <input type="file" onChange={handleCoverChange} />
            </Box>

            {coverPreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={coverPreview}
                  alt="cover-preview"
                  width="100%"
                  style={{
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleCoverUpload}
              disabled={coverUpload.loading}
              fullWidth
            >
              Upload image
            </Button>

            {coverUpload.loading && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress size={22} />
              </Box>
            )}

            {coverUpload.uploadedUrl && (
              <Typography
                sx={{
                  mt: 2,
                  color: "green",
                }}
              >
                Cover uploaded successfully ✔
              </Typography>
            )}

            {coverUpload.error && (
              <Typography
                sx={{
                  mt: 2,
                  color: "red",
                }}
              >
                {coverUpload.error}
              </Typography>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px dashed #ccc",
              borderRadius: 3,
              width: 320,
            }}
          >
            <Typography fontWeight={700}>Barcode Image</Typography>

            <Box sx={{ mt: 2 }}>
              <input type="file" onChange={handleBarcodeChange} />
            </Box>

            {barcodePreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={barcodePreview}
                  alt="barcode-preview"
                  width="100%"
                  style={{
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleBarcodeUpload}
              disabled={barcodeUpload.loading}
              fullWidth
            >
              Upload Barcode
            </Button>

            {barcodeUpload.loading && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress size={22} />
              </Box>
            )}

            {barcodeUpload.uploadedUrl && (
              <Typography
                sx={{
                  mt: 2,
                  color: "green",
                }}
              >
                Barcode uploaded successfully ✔
              </Typography>
            )}

            {barcodeUpload.error && (
              <Typography
                sx={{
                  mt: 2,
                  color: "red",
                }}
              >
                {barcodeUpload.error}
              </Typography>
            )}
          </Paper>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!coverUpload.uploadedUrl || !barcodeUpload.uploadedUrl}
        >
          Create Book
        </Button>
      </Paper>
    </Container>
  );
}
