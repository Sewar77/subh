import { useEffect, useMemo, useState } from "react";
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
import { useUpload } from "../../../../Hooks/useUpload";

export default function AddSectionTranslations() {
  const { sectionId } = useParams();

  const {
    addSectionTranslation,
    getSectionTranslationsBySectionId,
    sectionTranslations,
    fetchSectionById,
    section,
  } = usePages();

  const coverUpload = useUpload();

  const [form, setForm] = useState({
    locale: "en",
    title: "",
    content: "",
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // ================= LOAD DATA =================

  useEffect(() => {
    if (!sectionId) return;

    fetchSectionById(sectionId);
    getSectionTranslationsBySectionId(sectionId);
  }, [sectionId]);

  // ================= SECTION CONFIG =================

  const config = useMemo(() => {
    switch (section?.type) {
      case "hero":
        return {
          label: "Hero Section",
          title: true,
          text: true,
          media: true,
        };

      case "text":
        return {
          label: "Text Section",
          title: true,
          text: true,
          media: false,
        };

      case "image":
        return {
          label: "Image Section",
          title: false,
          text: false,
          media: true,
        };

      case "image_text":
      case "text_image":
        return {
          label: "Image + Text Section",
          title: true,
          text: true,
          media: true,
        };

      case "gallery":
        return {
          label: "Gallery Section",
          title: true,
          text: false,
          media: true,
        };

      case "contact_form":
        return {
          label: "Contact Form",
          title: true,
          text: true,
          media: false,
        };

      default:
        return {
          label: "Default Section",
          title: true,
          text: true,
          media: false,
        };
    }
  }, [section]);

  // ================= IMAGE =================

  const handleMediaChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // if (!validateImage(file)) return;

    setMediaFile(file);

    setMediaPreview(URL.createObjectURL(file));
  };

  // ================= SAVE =================

  const handleSubmit = async () => {
    let imageUrl = null;

    if (config.media && mediaFile) {
      const uploaded = await coverUpload.uploadImage(mediaFile);

      imageUrl = uploaded?.url || uploaded?.path || null;
    }

    const content = {};

    if (config.text) {
      content.text = form.content;
    }

    if (imageUrl) {
      content.image = imageUrl;
    }

    await addSectionTranslation({
      section_id: sectionId,

      data: {
        locale: form.locale,

        ...(config.title && {
          title: form.title,
        }),

        content,
      },
    });

    setForm({
      locale: "en",
      title: "",
      content: "",
    });

    setMediaFile(null);
    setMediaPreview(null);

    getSectionTranslationsBySectionId(sectionId);
  };

  const isValid = () => {
    if (config.title && !form.title) return false;

    if (config.text && !form.content) return false;

    if (config.media && !mediaFile) return false;

    return true;
  };

  return (
    <Container
      sx={{
        py: 6,
        maxWidth: "900px !important",
      }}
    >
      {/* SECTION INFO */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Title title="Section Details" caption={config.label} />

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Type: ${section?.type || "-"}`} />

            <Chip label={`Template: ${section?.template_name || "-"}`} />

            <Chip label={`Status: ${section?.status || "-"}`} />
          </Stack>
        </CardContent>
      </Card>

      {/* PERMISSIONS */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography fontWeight={700}>Allowed Fields</Typography>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1}>
            <Chip label={`Title ${config.title ? "✓" : "✕"}`} />

            <Chip label={`Text ${config.text ? "✓" : "✕"}`} />

            <Chip label={`Image ${config.media ? "✓" : "✕"}`} />
          </Stack>
        </CardContent>
      </Card>

      {/* FORM */}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={800}>
              Create Translation
            </Typography>

            <TextField
              select
              label="Language"
              value={form.locale}
              onChange={(e) =>
                setForm({
                  ...form,
                  locale: e.target.value,
                })
              }
            >
              <MenuItem value="en">English</MenuItem>

              <MenuItem value="ar">Arabic</MenuItem>
            </TextField>

            {config.title && (
              <TextField
                label="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />
            )}

            {config.text && (
              <TextField
                label="Content"
                multiline
                rows={5}
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
              />
            )}

            {config.media && (
              <Box>
                <Button variant="outlined" component="label">
                  Select Image
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleMediaChange}
                  />
                </Button>

                {mediaPreview && (
                  <Box
                    component="img"
                    src={mediaPreview}
                    sx={{
                      mt: 2,
                      width: "100%",
                      maxHeight: 350,
                      objectFit: "cover",
                      borderRadius: 3,
                    }}
                  />
                )}
              </Box>
            )}

            {!config.text && !config.media && (
              <Alert severity="info">
                This section does not require content.
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              disabled={!isValid()}
              onClick={handleSubmit}
            >
              Save Translation
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* HISTORY */}

      <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 2 }}>
        Translation Records
      </Typography>

      {!sectionTranslations?.length ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No translations available
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sectionTranslations.map((t) => (
            <Card key={t.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={800}>
                    {t.title || "Untitled"}
                  </Typography>

                  <Chip label={t.locale.toUpperCase()} />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography
                  sx={{
                    whiteSpace: "pre-line",
                  }}
                >
                  {t.content?.text || "No text content"}
                </Typography>

                {t.content?.image && (
                  <Box
                    component="img"
                    src={t.content.image}
                    sx={{
                      mt: 2,
                      width: "100%",
                      borderRadius: 2,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
