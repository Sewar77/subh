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

  const [bookData, setBookData] = useState({
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    weight_kg: "",
    barcode_image: "",
    category_id: "",
    price: "",
    shipping_cost: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const { uploadImage, uploadedUrl, loading, error } = useUpload();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Only images allowed");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = () => {
    if (!file) return toast.error("Select image first");
    uploadImage(file);
  };

  const handleSubmit = () => {
    if (!uploadedUrl) return toast.error("Upload image first");
    if (!bookData.name_en || !bookData.name_ar)
      return toast.error("Fill required fields");

    createBooks({
      ...bookData,
      barcode_image: uploadedUrl,
    });

    setBookData({
      name_en: "",
      name_ar: "",
      description_en: "",
      description_ar: "",
      weight_kg: "",
      barcode_image: "",
      category_id: "",
      author_name_en: "",
      author_name_ar: "",
      price: "",
      shipping_cost: "",
      length_cm: "",
      width_cm: "",
      height_cm: "",
    });

    setFile(null);
    setPreview("");
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
        Add Book
      </Typography>

      <Paper
        sx={{ mt: 3, p: 4, display: "flex", flexDirection: "column", gap: 3 }}
      >
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
          label="Author Name (English)"
          name="author_name_en"
          value={bookData.author_name_en}
          onChange={handleChange}
          fullWidth
        />

        <Divider />

        <Typography fontWeight={700}>العربية</Typography>

        <TextField
          label="الاسم"
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
          fullWidth
          multiline
          rows={2}
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

        {/* CATEGORY DROPDOWN */}
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
              {cat.name_en + " - " + cat.name_ar}
            </MenuItem>
          ))}
        </TextField>

        {/* PRODUCT DETAILS */}
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

        {/* IMAGE UPLOAD */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" },
            gap: { sm: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              p: { sm: 2, md: 4 },
              border: "1px dashed #ccc",
              borderRadius: 3,
              width: { sm: "100", md: "140" },
              m: 1,
            }}
          >
            <Typography fontWeight={600}>Book Image Upload</Typography>

            <input type="file" onChange={handleFileChange} />

            {preview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={preview}
                  alt="preview"
                  width={{ sm: "100", md: "140" }}
                  style={{ borderRadius: 12 }}
                />
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Upload Image
            </Button>

            {loading && <CircularProgress size={18} sx={{ ml: 2 }} />}

            {uploadedUrl && (
              <Typography sx={{ mt: 1, color: "green" }}>
                Image uploaded ✔
              </Typography>
            )}

            {error && (
              <Typography sx={{ mt: 1, color: "red" }}>{error}</Typography>
            )}
          </Box>
          <Box
            sx={{
              p: { sm: 3, md: 4 },
              border: "1px dashed #ccc",
              borderRadius: 3,
              m: 1,
            }}
          >
            <Typography fontWeight={600}>Barcode Image Upload</Typography>
            <input type="file" onChange={handleFileChange} />
            {preview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={preview}
                  alt="preview"
                  width="140"
                  style={{ borderRadius: 12 }}
                />
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Upload Image
            </Button>
            {loading && <CircularProgress size={18} sx={{ ml: 2 }} />}
            {uploadedUrl && (
              <Typography sx={{ mt: 1, color: "green" }}>
                Image uploaded ✔
              </Typography>
            )}
            {error && (
              <Typography sx={{ mt: 1, color: "red" }}>{error}</Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={
            !uploadedUrl ||
            !bookData.name_en ||
            !bookData.name_ar ||
            !bookData.category_id
          }
        >
          Create Book
        </Button>
      </Paper>
    </Container>
  );
}
