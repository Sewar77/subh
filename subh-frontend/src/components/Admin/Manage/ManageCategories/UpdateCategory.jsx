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
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUpload } from "../../../../Hooks/useUpload";
import { useCategories } from "../../../../Hooks/useCategories";

export default function UpdateCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { category, getCategory, updateCategory } = useCategories();
  const { uploadImage, uploadedUrl, loading, error } = useUpload();

  const [catData, setCatData] = useState({
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    image: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    if (id) getCategory(id);
  }, [id]);

  useEffect(() => {
    if (category) {
      setCatData({
        name_en: category.name_en || "",
        name_ar: category.name_ar || "",
        description_en: category.description_en || "",
        description_ar: category.description_ar || "",
        image: category.image || "",
      });

      setCurrentImage(category.image || "");
    }
  }, [category]);

  const handleChange = (field) => (e) => {
    setCatData((prev) => ({
      ...prev,
      [field]: e.target.value,
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
  const handleUpdate = async () => {
    if (!catData.name_en || !catData.name_ar) {
      toast.error("Both English and Arabic names are required");
      return;
    }
    await updateCategory(id, {
      ...catData,
      image: uploadedUrl || currentImage,
    });
    navigate("/admin/categories");
  };

  if (!category) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography>Loading category...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
        Update Category
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
        {/* ENGLISH */}
        <Typography sx={{ fontWeight: 700, alignSelf: "center" }}>
          English
        </Typography>

        <TextField
          label="Name (English)"
          value={catData.name_en}
          onChange={handleChange("name_en")}
          fullWidth
        />

        <TextField
          label="Description (English)"
          value={catData.description_en}
          onChange={handleChange("description_en")}
          fullWidth
          multiline
          rows={2}
        />

        <Divider />

        {/* ARABIC */}
        <Typography sx={{ fontWeight: 700, alignSelf: "center" }}>
          العربية
        </Typography>

        <TextField
          label="الاسم"
          value={catData.name_ar}
          onChange={handleChange("name_ar")}
          fullWidth
          InputProps={{ dir: "rtl" }}
        />

        <TextField
          label="الوصف"
          value={catData.description_ar}
          onChange={handleChange("description_ar")}
          fullWidth
          multiline
          rows={2}
          InputProps={{ dir: "rtl" }}
        />

        <Divider />

        {/* IMAGE */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px dashed rgba(15, 23, 42, 0.2)",
            bgcolor: "#f8fafc",
          }}
        >
          <Typography sx={{ mb: 1, fontWeight: 600 }}>Image Update</Typography>

          {!preview && currentImage && (
            <Box sx={{ mb: 2 }}>
              <img
                src={currentImage}
                width="140"
                style={{ borderRadius: 12 }}
              />
            </Box>
          )}

          <input type="file" onChange={handleFileChange} />

          {preview && (
            <Box sx={{ mt: 2 }}>
              <img src={preview} width="140" style={{ borderRadius: 12 }} />
            </Box>
          )}

          <Button
            variant="outlined"
            sx={{ mt: 2, textTransform: "none" }}
            onClick={handleUpload}
            disabled={loading}
          >
            Upload New Image
          </Button>

          {loading && <CircularProgress size={18} sx={{ ml: 2 }} />}

          {error && (
            <Typography sx={{ mt: 1, color: "red" }}>{error}</Typography>
          )}
        </Box>

        {/* ACTION */}
        <Button variant="contained" size="large" onClick={handleUpdate}>
          Save Changes
        </Button>
      </Paper>
    </Container>
  );
}
