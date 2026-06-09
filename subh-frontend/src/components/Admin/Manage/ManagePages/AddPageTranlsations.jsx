import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import Title from "../../Headers/Titles";

export default function AddPageTranlsations() {
  const { pageId } = useParams();
  const { addPageTranslation, loading } = usePages();
  const [form, setForm] = useState({
    locale: "en",
    title: "",
    slug: "",
    seo_title: "",
    seo_description: "",
  });
  const [success, setSuccess] = useState(false);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    await addPageTranslation(pageId, form);
    setSuccess(true);
    setForm({
      locale: "en",
      title: "",
      slug: "",
      seo_title: "",
      seo_description: "",
    });
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        my: 5,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: "90%",
          borderRadius: 3,
          margin: "auto",
        }}
      >
        {/* HEADER */}
        <Title
          title={"Add Page Translation"}
          caption={" Create a language version for this page"}
        />

        <Divider sx={{ mb: 6 }} />

        {/* SUCCESS */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, fontSize: "1rem" }}>
            Translation added successfully
          </Alert>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* LOCALE */}
            <TextField
              select
              label="Language"
              name="locale"
              value={form.locale}
              onChange={handleChange}
              helperText="Choose the language version for this page"
              InputLabelProps={{ style: { fontSize: 18 } }}
              inputProps={{ style: { fontSize: 16 } }}
              required
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
            </TextField>

            {/* TITLE */}
            <TextField
              label="Page Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              helperText="This is what users will see on the page"
              InputLabelProps={{ style: { fontSize: 18 } }}
              inputProps={{ style: { fontSize: 16 } }}
              required
            />

            {/* SLUG */}
            <TextField
              label="URL Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              helperText="Example: about-us (used in the URL)"
              InputLabelProps={{ style: { fontSize: 18 } }}
              inputProps={{ style: { fontSize: 16 } }}
            />

            {/* SEO TITLE */}
            <TextField
              label="SEO Title"
              name="seo_title"
              value={form.seo_title}
              onChange={handleChange}
              helperText="Title shown in Google search results"
              InputLabelProps={{ style: { fontSize: 18 } }}
              inputProps={{ style: { fontSize: 16 } }}
            />

            {/* SEO DESCRIPTION */}
            <TextField
              label="SEO Description"
              name="seo_description"
              value={form.seo_description}
              onChange={handleChange}
              multiline
              rows={4}
              helperText="Short description for search engines (important for SEO)"
              InputLabelProps={{ style: { fontSize: 18 } }}
              inputProps={{ style: { fontSize: 16 } }}
            />

            {/* BUTTON */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Create Translation"
              )}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
