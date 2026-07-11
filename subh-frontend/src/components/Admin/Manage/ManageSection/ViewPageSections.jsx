import { useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { usePages } from "../../../../Context/pageContext";
import Title from "../../Headers/Titles";

export default function ViewPageSections() {
  const { pageId } = useParams();

  const { page, sections, fetchPageById, getSectionsByPageId, deleteSection } =
    usePages();

  // -----------------------------
  // Load page + sections
  // -----------------------------
  useEffect(() => {
    if (pageId) {
      fetchPageById(pageId);
      getSectionsByPageId(pageId);
    }
  }, [pageId]);

  // -----------------------------
  // Type config (your CMS brain)
  // -----------------------------
  const typeConfig = {
    hero: { showImage: false, showText: true, multipleImages: false },
    text: { showImage: false, showText: true, multipleImages: false },
    image: { showImage: true, showText: false, multipleImages: false },
    image_text: { showImage: true, showText: true, multipleImages: false },
    text_image: { showImage: true, showText: true, multipleImages: false },
    gallery: { showImage: true, showText: false, multipleImages: true },
    contact_form: { showImage: false, showText: true, multipleImages: false },
  };

  const getTypeLabel = (type) => {
    const map = {
      hero: "Hero Section",
      text: "Text Block",
      image: "Image Section",
      image_text: "Image + Text",
      text_image: "Text + Image",
      gallery: "Gallery",
      contact_form: "Contact Form",
    };
    return map[type] || type;
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  const getLocalized = (section, locale = "en") => {
    const trans = section.translations || [];
    const active = trans.find((t) => t.locale === locale);

    return {
      ...section,
      title: active?.title || "",
      content: active?.content?.text || "",
    };
  };

  const getImages = (section) => {
    if (!section.media) return [];
    return section.media.filter((m) => m.role === "image");
  };

  // -----------------------------
  // Render single section card
  // -----------------------------
  const renderSection = (section) => {
    const config = typeConfig[section.type] || {};
    const localized = getLocalized(section);
    const images = getImages(section);

    return (
      <Card
        key={section.id}
        sx={{
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* HEADER */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 900 }}>
              {getTypeLabel(section.type)}
            </Typography>

            <Chip
              label={section.is_visible ? "Visible" : "Hidden"}
              color={section.is_visible ? "success" : "default"}
            />
          </Box>

          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Position #{section.position} • ID {section.id}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* TEXT */}
          {config.showText && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>
                English Content
              </Typography>

              <Typography sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
                {localized.content || "No content"}
              </Typography>
            </Box>
          )}

          {/* IMAGES */}
          {config.showImage && (
            <Box sx={{ mb: 3 }}>
              {config.multipleImages ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 2,
                  }}
                >
                  {images.map((img) => (
                    <Box
                      key={img.media_id}
                      component="img"
                      src={img.url}
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Box
                  component="img"
                  src={images[0]?.url}
                  sx={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "cover",
                    borderRadius: 3,
                  }}
                />
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* ACTIONS */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained">Edit</Button>
            <Button variant="outlined">Toggle</Button>
            <Button
              color="error"
              variant="outlined"
              onClick={() => deleteSection(section.id)}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Box sx={{ p: 5, background: "#f6f7fb", minHeight: "100vh" }}>
      {/* HEADER */}
      <Title
        title={page?.title || "Page Sections"}
        caption={`Page ID: ${pageId}`}
      />

      <Typography sx={{ mb: 4, color: "text.secondary" }}>
        Full CMS page inspector — every section in one timeline view.
      </Typography>

      {/* SECTIONS */}
      <Stack>
        {sections?.sort((a, b) => a.position - b.position).map(renderSection)}
      </Stack>
    </Box>
  );
}
