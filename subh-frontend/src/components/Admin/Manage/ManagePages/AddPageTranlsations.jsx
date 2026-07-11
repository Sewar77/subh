import { useEffect, useState } from "react";
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
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { usePages } from "../../../../Context/pageContext";
import Title from "../../Headers/Titles";

export default function AddPageTranlsations() {
  const { pageId } = useParams();

  const {
    addPageTranslation,
    loading,
    fetchPageById,
    page,
    pageTranslations,
    fetchPageTranslations,
  } = usePages();

  const [form, setForm] = useState({
    locale: "en",
    title: "",
    slug: "",
    seo_title: "",
    seo_description: "",
  });

  const [success, setSuccess] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    if (pageId) {
      fetchPageById(pageId);
      fetchPageTranslations(pageId);
    }
  }, [pageId]);

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
    setLastAdded(form);

    await fetchPageTranslations(pageId);

    setForm({
      locale: "en",
      title: "",
      slug: "",
      seo_title: "",
      seo_description: "",
    });
  };

  const hasLocale = (locale) =>
    pageTranslations?.some((t) => t.locale === locale);

  return (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center", my: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: "90%",
          borderRadius: 3,
          fontSize: "1.05rem",
        }}
      >
        {/* HEADER */}
        <Title
          title={"Add Page Translation"}
          caption={"Create a language version for this page"}
        />

        <Divider sx={{ my: 3 }} />

        {/* CONTEXT PANEL */}
        <Box
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: "1px solid #ddd",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography sx={{ fontSize: "1.3rem", fontWeight: 900 }}>
            You are editing this page
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Page:</strong> {page?.key}
          </Typography>

          <Typography>
            <strong>Template:</strong> {page?.template_name}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Existing Translations
          </Typography>

          <Stack direction="row" sx={{ justifyContent: "center" }} spacing={2}>
            <Chip
              label={`EN ${hasLocale("en") ? "✔" : "✖"}`}
              color={hasLocale("en") ? "success" : "default"}
            />
            <Chip
              label={`AR ${hasLocale("ar") ? "✔" : "✖"}`}
              color={hasLocale("ar") ? "success" : "default"}
            />
          </Stack>
        </Box>

        {/* SUCCESS */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
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
              helperText="This determines which language version users will see"
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
              helperText="Main title shown to users on the page"
              required
            />

            {/* SLUG */}
            <TextField
              label="URL Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              helperText="URL path (example: /about-us). Must be unique."
              inputProps={{ style: { fontFamily: "monospace" } }}
            />

            {/* SEO TITLE */}
            <TextField
              label="SEO Title"
              name="seo_title"
              value={form.seo_title}
              onChange={handleChange}
              helperText="Title shown on Google search results (important for SEO)"
            />

            {/* SEO DESCRIPTION */}
            <TextField
              label="SEO Description"
              name="seo_description"
              value={form.seo_description}
              multiline
              rows={4}
              helperText="Short summary shown in search engines to improve clicks"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Create Translation"
              )}
            </Button>
          </Stack>
        </form>

        {/* EXISTING + NEW TRANSLATIONS VIEW */}
        <Divider sx={{ my: 5 }} />

        <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, mb: 2 }}>
          Translations Overview
        </Typography>

        <Stack spacing={3}>
          {pageTranslations?.map((t) => (
            <Card key={t.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Chip label={t.locale.toUpperCase()} color="primary" />
                </Stack>

                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                  <strong>Title:</strong> {t.title}
                </Typography>

                <Typography sx={{ fontFamily: "monospace", mt: 1 }}>
                  <strong>Slug:</strong> {t.slug}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>SEO Title:</strong> {t.seo_title}
                </Typography>

                <Typography sx={{ fontSize: "0.9rem", opacity: 0.8 }}>
                  <strong>SEO Description:</strong> {t.seo_description}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {/* NEWLY ADDED PREVIEW */}
          {lastAdded && (
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: "2px dashed #4caf50",
                backgroundColor: "#f6fff7",
              }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1 }}>
                Recently Added
              </Typography>

              <Typography>
                {lastAdded.locale.toUpperCase()} — {lastAdded.title}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
