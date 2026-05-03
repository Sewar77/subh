import {
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import toast from "react-hot-toast";
import { useState } from "react";
import { useUpload } from "../../../../Hooks/useUpload";
import { useCategories } from "../../../../Hooks/useCategories";

export default function AddCategory() {
  const { createCategories } = useCategories();
  // bilingual state
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  // image state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const { uploadImage, uploadedUrl, loading, error } = useUpload();
  // file select
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

  // upload image
  const handleUpload = () => {
    if (!file) {
      toast.error("Select image first");
      return;
    }

    uploadImage(file);
  };

  // submit category
  const handleSubmit = () => {
    if (!nameEn || !nameAr) {
      toast.error("English and Arabic names are required");
      return;
    }

    if (!uploadedUrl) {
      toast.error("Upload image first");
      return;
    }

    const data = {
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descEn,
      description_ar: descAr,
      image: uploadedUrl,
    };

    createCategories(data);

    console.log("FINAL DATA:", data);

    // optional reset
    setNameEn("");
    setNameAr("");
    setDescEn("");
    setDescAr("");
    setFile(null);
    setPreview("");
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Add Category
      </Typography>

      <Paper
        sx={{
          mt: 3,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
        elevation={4}
      >
        {/* English */}
        <TextField
          label="Name (English)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          fullWidth
        />

        <TextField
          label="Description (English)"
          value={descEn}
          onChange={(e) => setDescEn(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        {/* Arabic */}
        <TextField
          label="الاسم باللغة العربية"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          fullWidth
          inputProps={{ dir: "rtl" }}
        />

        <TextField
          label="الوصف باللغة العربية"
          value={descAr}
          onChange={(e) => setDescAr(e.target.value)}
          fullWidth
          multiline
          rows={2}
          inputProps={{ dir: "rtl" }}
        />

        {/* Upload */}
        <Box>
          <Typography sx={{ mb: 1 }}>Upload Image</Typography>

          <input type="file" onChange={handleFileChange} />

          {preview && (
            <Box sx={{ mt: 2 }}>
              <img
                src={preview}
                alt="preview"
                width="150"
                style={{ borderRadius: 8 }}
              />
            </Box>
          )}

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleUpload}
            disabled={loading}
          >
            Upload Image
          </Button>

          {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}

          {uploadedUrl && (
            <Typography sx={{ mt: 1, color: "green" }}>
              Image uploaded ✅
            </Typography>
          )}

          {error && (
            <Typography sx={{ mt: 1, color: "red" }}>{error}</Typography>
          )}
        </Box>

        {/* Submit */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!uploadedUrl || !nameEn || !nameAr}
        >
          Add Category
        </Button>
      </Paper>
    </Container>
  );
}
