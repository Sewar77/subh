import { useEffect, useState } from "react";
import { usePagesContext } from "../../../../../Context/pagesContext.jsx";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { api } from "../../../../../../api.js";

export default function ManageAboutPage() {
  const { getPageBySlug, page, updatePage, loading } = usePagesContext();

  const [sections, setSections] = useState([]);

  const [form, setForm] = useState({
    title_en: "",
    title_ar: "",
    seo_title_en: "",
    seo_title_ar: "",
    seo_description_en: "",
    seo_description_ar: "",
  });

  const [sectionForm, setSectionForm] = useState({
    title_en: "",
    content_en: "",
    media_id: "",
    order_number: 0,
  });

  useEffect(() => {
    getPageBySlug("about");
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const res = await api.get("/page-sections/about");
    setSections(res.data);
  };

  useEffect(() => {
    if (page) {
      setForm({
        title_en: page.title_en || "",
        title_ar: page.title_ar || "",
        seo_title_en: page.seo_title_en || "",
        seo_title_ar: page.seo_title_ar || "",
        seo_description_en: page.seo_description_en || "",
        seo_description_ar: page.seo_description_ar || "",
      });
    }
  }, [page]);

  const handlePageChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (e) => {
    setSectionForm({ ...sectionForm, [e.target.name]: e.target.value });
  };

  const savePage = async () => {
    await updatePage(page.id, form);
  };

  const addSection = async () => {
    await api.post("/page-sections", {
      page_slug: "about",
      ...sectionForm,
    });

    setSectionForm({
      title_en: "",
      content_en: "",
      media_id: "",
      order_number: 0,
    });

    fetchSections();
  };

  const deleteSection = async (id) => {
    await api.delete(`/page-sections/${id}`);
    fetchSections();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" mb={4} fontWeight={600}>
        Manage About Page
      </Typography>

      {/* PAGE SETTINGS */}
      <Paper
        sx={{ p: 3, mb: 4, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6">Page Settings</Typography>

        <TextField
          label="Title EN"
          name="title_en"
          value={form.title_en}
          onChange={handlePageChange}
        />
        <TextField
          label="Title AR"
          name="title_ar"
          value={form.title_ar}
          onChange={handlePageChange}
        />

        <TextField
          label="SEO Title EN"
          name="seo_title_en"
          value={form.seo_title_en}
          onChange={handlePageChange}
        />
        <TextField
          label="SEO Title AR"
          name="seo_title_ar"
          value={form.seo_title_ar}
          onChange={handlePageChange}
        />

        <TextField
          multiline
          rows={3}
          label="SEO Description EN"
          name="seo_description_en"
          value={form.seo_description_en}
          onChange={handlePageChange}
        />

        <TextField
          multiline
          rows={3}
          label="SEO Description AR"
          name="seo_description_ar"
          value={form.seo_description_ar}
          onChange={handlePageChange}
        />

        <Button variant="contained" onClick={savePage} disabled={loading}>
          Save Page Settings
        </Button>
      </Paper>

      {/* SECTIONS */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Add Section
        </Typography>

        <TextField
          fullWidth
          label="Title EN"
          name="title_en"
          value={sectionForm.title_en}
          onChange={handleSectionChange}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Content EN"
          name="content_en"
          value={sectionForm.content_en}
          onChange={handleSectionChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Media ID"
          name="media_id"
          value={sectionForm.media_id}
          onChange={handleSectionChange}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Order"
          name="order_number"
          value={sectionForm.order_number}
          onChange={handleSectionChange}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={addSection}>
          Add Section
        </Button>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* LIST */}
      {sections
        .sort((a, b) => a.order_number - b.order_number)
        .map((s) => (
          <Paper key={s.id} sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight="bold">{s.title_en}</Typography>
            <Typography>{s.content_en}</Typography>

            <Button
              color="error"
              sx={{ mt: 1 }}
              onClick={() => deleteSection(s.id)}
            >
              Delete
            </Button>
          </Paper>
        ))}
    </Box>
  );
}
