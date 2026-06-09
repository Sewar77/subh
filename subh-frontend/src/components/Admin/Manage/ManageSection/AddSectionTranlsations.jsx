import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import Title from "../../Headers/Titles";

export default function AddSectionTranlsations() {
  const { sectionId } = useParams();

  const {
    addSectionTranslation,
    getSectionTranslationsBySectionId,
    sectionTranslations,
    fetchSectionById,
    section,
  } = usePages();

  const [form, setForm] = useState({
    locale: "en",
    title: "",
    content: "",
    media: null,
  });

  useEffect(() => {
    if (sectionId) {
      fetchSectionById(sectionId);
      getSectionTranslationsBySectionId(sectionId);
    }
  }, [sectionId]);

  // ================= SECTION TYPE CONFIG =================
  const sectionType = section?.type;

  const config = useMemo(() => {
    switch (sectionType) {
      case "hero":
        return { title: true, text: true, media: true, label: "Hero Section" };

      case "text":
        return { title: true, text: true, media: false, label: "Text Section" };

      case "image_text":
      case "text_image":
        return {
          title: true,
          text: true,
          media: true,
          label: "Media + Text Section",
        };

      case "image":
        return {
          title: false,
          text: false,
          media: true,
          label: "Image Section",
        };

      case "gallery":
        return {
          title: true,
          text: false,
          media: true,
          label: "Gallery Section",
        };

      case "contact_form":
        return { title: true, text: true, media: false, label: "Form Section" };

      default:
        return {
          title: true,
          text: true,
          media: false,
          label: "Default Section",
        };
    }
  }, [sectionType]);

  // ================= PAYLOAD =================
  const payload = useMemo(() => {
    const data = { locale: form.locale };

    if (config.title) data.title = form.title;
    if (config.text) data.content = { text: form.content };
    if (config.media) data.media = form.media;

    return data;
  }, [form, config]);

  const isValid = useMemo(() => {
    if (config.title && !form.title) return false;
    if (config.text && !form.content) return false;
    return true;
  }, [form, config]);

  const handleSubmit = async () => {
    if (!isValid) return;

    await addSectionTranslation({
      section_id: sectionId,
      data: payload,
    });

    setForm({
      locale: "en",
      title: "",
      content: "",
      media: null,
    });

    getSectionTranslationsBySectionId(sectionId);
  };

  return (
    <Container sx={{ py: 6, maxWidth: "900px !important" }}>
      {/* ================= SECTION HEADER ================= */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Title title={"Section Details"} caption={config.label} />

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Type: ${section?.type || "loading"}`} />
            <Chip label={`Template: ${section?.template_name || "-"}`} />
            <Chip label={`Status: ${section?.status || "-"}`} />
            <Chip
              label={`Visible: ${section?.is_visible ? "Yes" : "No"}`}
              color={section?.is_visible ? "success" : "error"}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ================= PERMISSIONS ================= */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Field Permissions
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Title: ${config.title ? "Allowed" : "Disabled"}`} />
            <Chip label={`Text: ${config.text ? "Allowed" : "Disabled"}`} />
            <Chip label={`Media: ${config.media ? "Allowed" : "Disabled"}`} />
          </Stack>
        </CardContent>
      </Card>

      {/* ================= FORM ================= */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Create Translation
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Locale"
              value={form.locale}
              onChange={(e) => setForm({ ...form, locale: e.target.value })}
              fullWidth
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
            </TextField>

            {config.title && (
              <TextField
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                fullWidth
              />
            )}

            {config.text && (
              <TextField
                label="Content"
                multiline
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                fullWidth
              />
            )}

            {!config.text && (
              <Alert severity="info">
                This section type does not support text content.
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Save Translation
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ================= HISTORY ================= */}
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ mb: 3, fontSize: "1.5rem" }}
      >
        Translation Records
      </Typography>

      {!sectionTranslations?.length ? (
        <Card
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No translations available for this section
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {sectionTranslations.map((t) => (
            <Card
              key={t.id}
              sx={{
                borderRadius: 3,
                transition: "0.25s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                {/* TOP ROW */}
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{ fontSize: "1.15rem" }}
                    >
                      {t.title || "Untitled Translation"}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                    >
                      ID: {t.id}
                    </Typography>
                  </Box>

                  <Chip
                    label={t.locale.toUpperCase()}
                    size="medium"
                    color={t.locale === "ar" ? "success" : "primary"}
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                {/* DIVIDER */}
                <Divider sx={{ my: 2 }} />

                {/* CONTENT BOX */}
                <Box
                  sx={{
                    backgroundColor: "grey.50",
                    borderRadius: 2,
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1rem",
                      lineHeight: 1.8,
                      color: "text.secondary",
                      whiteSpace: "pre-wrap",
                      textAlign: "left",
                    }}
                  >
                    {t.content?.text || "No content available"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
