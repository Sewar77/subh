import { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import Title from "../../Headers/Titles";

export default function ViewSection() {
  const { sectionId } = useParams();
  const { fetchSectionById, deleteSection, section, toggleSectionVisibility } =
    usePages();
  const navigate = useNavigate();
  useEffect(() => {
    if (sectionId) fetchSectionById(sectionId);
  }, [sectionId]);
  section;

  const typeConfig = {
    hero: {
      showImage: false,
      showText: true,
      multipleImages: false,
    },
    text: {
      showImage: false,
      showText: true,
      multipleImages: false,
    },
    image: {
      showImage: true,
      showText: false,
      multipleImages: false,
    },
    image_text: {
      showImage: true,
      showText: true,
      multipleImages: false,
    },
    text_image: {
      showImage: true,
      showText: true,
      multipleImages: false,
    },
    gallery: {
      showImage: true,
      showText: true,
      multipleImages: true,
    },
    contact_form: {
      showImage: false,
      showText: true,
      multipleImages: false,
    },
  };
  const getTypeLabel = (type) => {
    const map = {
      hero: "Hero Section",
      text: "Text Block",
      image_text: "Image + Text",
      image: "Image Section",
    };
    return map[type] || type;
  };

  if (!section) return null;

  const en = section.translations?.find((t) => t.locale === "en");
  const ar = section.translations?.find((t) => t.locale === "ar");

  const config = typeConfig[section.type] || {};
  const getImages = (section) => {
    if (!section.media) return [];

    return section.media.filter((m) => m.role === "image");
  };
  const handleToggle = async (sectionId) => {
    sectionId;
    await toggleSectionVisibility(sectionId);
  };
  const images = getImages(section);
  return (
    <Box
      sx={{
        p: 5,
        background: "#f6f7fb",
        minHeight: "100vh",
        justifyContent: "center",
      }}
    >
      {/* HEADER */}
      <Title
        title="Section Control Center"
        caption={`Page: ${section.page_key} • Template: ${section.template_name}`}
      />

      <Typography sx={{ fontSize: "1.2rem", color: "text.secondary", mb: 4 }}>
        This is a live CMS section inspector. Every block here represents a
        modular piece of your webpage. Think of it like LEGO bricks — except
        these bricks can talk, translate, and sometimes break in Arabic.
      </Typography>

      {/* MAIN CARD */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* HEADER STRIP */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: "1.8rem", fontWeight: 900 }}>
              {getTypeLabel(section.type)}
            </Typography>

            <Chip
              label={section.is_visible ? "Visible on Website" : "Hidden"}
              color={section.is_visible ? "success" : "default"}
              sx={{ fontSize: "1rem", p: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* BASIC INFO */}
          <Box>
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 800 }}>
              Position in Page Flow
            </Typography>
            <Typography sx={{ fontSize: "1rem", color: "text.secondary" }}>
              Controls where this section appears on the page
            </Typography>
            <Typography sx={{ fontSize: "1.3rem", mt: 1 }}>
              #{section.position}
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* PAGE CONTEXT */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: "#eef4ff",
            }}
          >
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, mb: 1 }}>
              Page Context
            </Typography>

            <Typography sx={{ fontSize: "1.1rem" }}>
              Page Key: <strong>{section.page_key}</strong>
            </Typography>

            <Typography sx={{ fontSize: "1.1rem" }}>
              Status: {section.status}
            </Typography>

            <Typography sx={{ fontSize: "1.1rem" }}>
              Template: {section.template_name}
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* TRANSLATIONS TITLE */}
          <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, mb: 2 }}>
            Multilingual Content
          </Typography>

          {/* EN */}
          <Card
            sx={{
              mb: 3,
              p: 3,
              borderLeft: "6px solid #1976d2",
            }}
          >
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800 }}>
              English Version
            </Typography>

            <Typography sx={{ fontSize: "1.1rem", mt: 1 }}>
              Title: {en?.title || "Missing"}
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                background: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              {en?.content && Object.keys(en.content).length > 0 ? (
                <Stack spacing={2}>
                  {Object.entries(en.content).map(([key, value]) => (
                    <Box key={key}>
                      <Typography
                        sx={{ fontWeight: 800, fontSize: "1rem", mb: 0.5 }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "1rem",
                          color: "text.secondary",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No content yet</Typography>
              )}
            </Box>

            <Chip
              sx={{ mt: 2 }}
              label={en?.is_visible ? "Active" : "Inactive"}
              color={en?.is_visible ? "success" : "default"}
            />
          </Card>

          {/* AR */}
          <Card
            sx={{
              mb: 3,
              p: 3,
              borderLeft: "6px solid #9c27b0",
              direction: "rtl",
            }}
          >
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800 }}>
              النسخة العربية
            </Typography>

            <Typography sx={{ fontSize: "1.1rem", mt: 1 }}>
              العنوان: {ar?.title || "غير موجود"}
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                background: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              {ar?.content && Object.keys(ar.content).length > 0 ? (
                <Stack spacing={2}>
                  {Object.entries(ar.content).map(([key, value]) => (
                    <Box key={key}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1rem",
                          mb: 0.5,
                        }}
                      >
                        {key === "vision"
                          ? "الرؤية"
                          : key === "mission"
                            ? "الرسالة"
                            : key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "1rem",
                          color: "text.secondary",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">لا يوجد محتوى</Typography>
              )}
            </Box>

            <Chip
              sx={{ mt: 2 }}
              label={ar?.is_visible ? "نشط" : "غير نشط"}
              color={ar?.is_visible ? "success" : "default"}
            />
          </Card>

          {/* MEDIA */}
          {config.showImage && images.length > 0 && (
            <Box sx={{ my: 3 }}>
              <Divider sx={{ my: 4 }} />
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
                        boxShadow: 2,
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
                    boxShadow: 3,
                  }}
                />
              )}
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* ACTIONS */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() =>
                navigate(`/admin/edit-section-content/${section.id}`)
              }
            >
              Edit Content
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => handleToggle(section.id)}
            >
              Toggle Visibility
            </Button>

            <Button
              color="error"
              variant="outlined"
              size="large"
              onClick={async () => deleteSection(section.id)}
            >
              Delete Section
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
