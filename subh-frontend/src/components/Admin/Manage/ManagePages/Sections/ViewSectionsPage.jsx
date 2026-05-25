import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Grid,
  Divider,
  Button,
  Alert,
} from "@mui/material";
import { useEffect } from "react";
import { useSections } from "../../../../../Hooks/useSections";
import { useNavigate, useParams } from "react-router-dom";
import AddButton from "../../../Buttons/AddBtn";
export default function ViewSectionsPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { fetchSectionsPage, sections, deleteSectionPage } = useSections();
  useEffect(() => {
    if (pageId) fetchSectionsPage(pageId);
  }, [pageId]);
  const handleDeleteSection = (sectionId, pageId) => {
    deleteSectionPage(sectionId, pageId);
  };
  if (!sections || sections.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Typography variant="h4">No sections yet</Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 500 }}
        >
          This page is empty. Sections are the building blocks of your page
          (like hero, text, media blocks). Start by creating your first section
          to structure the content.
        </Typography>
        <AddButton label="Section" to={`/admin/create-section/${pageId}`} />
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
        Page Builder
      </Typography>
      <AddButton
        sx={{ my: 4, mb: 3 }}
        label="Section"
        to={`/admin/create-section/${pageId}`}
      />
      <Grid container spacing={2} sx={{ justifyContent: "center", mt: 3 }}>
        {sections?.map((section) => {
          const sectionGuide = {
            hero: "Main banner section shown at the top of the page. Usually contains title, subtitle and background image.",
            paragraph:
              "Text content section used for descriptions, explanations or articles.",
            text: "Simple text block section for general content.",
            gallery: "Image collection section used for visual display.",
          };
          return (
            <Grid item xs={12} sm={6} md={4} key={section.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {section.type} Section
                    </Typography>

                    <Chip
                      label={`Order ${section.position}`}
                      color="primary"
                      size="small"
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* ADMIN GUIDE / INFO */}
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {sectionGuide[section.type] ||
                      "Custom section used for content display."}
                  </Alert>

                  {/* CONTENT PREVIEW */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Content Preview
                  </Typography>

                  {Object.keys(section.settings || {}).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No content added yet. Click edit to start building this
                      section.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {Object.entries(section.settings).map(([key, value]) => (
                        <Box
                          key={key}
                          sx={{
                            p: 1,
                            border: "1px solid #eee",
                            borderRadius: 2,
                            background: "#fafafa",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {key}
                          </Typography>
                          <Typography variant="body2">
                            {String(value)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* META INFO (LESS TECHY) */}
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Visibility:{" "}
                      <Chip
                        label={section.is_visible ? "Visible" : "Hidden"}
                        color={section.is_visible ? "success" : "error"}
                        size="small"
                      />
                    </Typography>

                    <Typography variant="body2">
                      This section is displayed in order number{" "}
                      <strong>{section.position}</strong> on the page.
                    </Typography>
                  </Stack>
                </CardContent>

                {/* ACTIONS */}
                <Box sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() =>
                        navigate(
                          `/admin/update-section/${section.page_id}/${section.id}`,
                        )
                      }
                    >
                      Edit Section
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() =>
                        handleDeleteSection(section.id, section.page_id)
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
