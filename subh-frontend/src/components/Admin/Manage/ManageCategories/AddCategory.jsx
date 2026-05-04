import {
  Button,
  CircularProgress,
  Container,
  Box,
  TextField,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";
import { useState } from "react";
import { useUpload } from "../../../../Hooks/useUpload";
import { useCategories } from "../../../../Hooks/useCategories";

export default function AddCategory() {
  const { createCategories } = useCategories();

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const { uploadImage, uploadedUrl, loading, error } = useUpload();

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
    if (!nameEn || !nameAr) {
      toast.error("Both English and Arabic names are required");
      return;
    }

    if (!uploadedUrl) {
      toast.error("Upload image first");
      return;
    }

    createCategories({
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descEn,
      description_ar: descAr,
      image: uploadedUrl,
    });

    setNameEn("");
    setNameAr("");
    setDescEn("");
    setDescAr("");
    setFile(null);
    setPreview("");
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
        Add Category
      </Typography>

      <Paper
        sx={{
          mt: 3,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
        elevation={3}
      >
        <Typography fontWeight={700} color="text.primary">
          English
        </Typography>

        <TextField
          label="Name (English)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />

        <TextField
          label="Description (English)"
          value={descEn}
          onChange={(e) => setDescEn(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />

        <Divider />

        {/* ARABIC */}
        <Typography fontWeight={700} textAlign="right" color="text.secondary">
          العربية
        </Typography>

        <TextField
          label="الاسم"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          fullWidth
          InputProps={{ dir: "rtl" }}
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />

        <TextField
          label="الوصف"
          value={descAr}
          onChange={(e) => setDescAr(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
          InputProps={{ dir: "rtl" }}
        />

        <Divider />

        {/* IMAGE UPLOAD */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px dashed rgba(15, 23, 42, 0.2)",
            bgcolor: "#f8fafc",
          }}
        >
          <Typography sx={{ mb: 1, fontWeight: 600 }}>Image Upload</Typography>

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
            variant="outlined"
            sx={{ mt: 2, textTransform: "none" }}
            onClick={handleUpload}
            disabled={loading}
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

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!uploadedUrl || !nameEn || !nameAr}
        >
          Create Category
        </Button>
      </Paper>
    </Container>
  );
}
