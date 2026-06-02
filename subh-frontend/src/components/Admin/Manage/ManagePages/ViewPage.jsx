import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import { useEffect } from "react";
import AddButton from "../../Buttons/AddBtn";
export default function ViewPage() {
  const { fetchPageById, page, getSectionsByPageId, sections } = usePages();
  const { pageId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    fetchPageById(pageId);
    getSectionsByPageId(pageId);
  }, [pageId]);

  if (!page) return null;

  return (
    <Container sx={{ py: 4 }}>
      {/* HEADER */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", my: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Page: {page.key}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Template: {page.template_name}
          </Typography>
        </Box>

        <Chip
          label={page.status}
          color={page.status === "draft" ? "warning" : "success"}
          size="large"
          sx={{ p: 3, fontSize: "20px" }}
        />
      </Stack>

      {/* ACTIONS */}
      <Stack direction="row" spacing={2} sx={{ my: 3 }}>
        <AddButton label="Section" to={`/admin/create-section/${page.id}`} />

        <Button
          onClick={() => navigate(`/admin/view-section/${page.id}`)}
          variant="outlined"
        >
          View Sections
        </Button>

        <Button variant="outlined" color="secondary">
          Edit Page
        </Button>

        <Button variant="outlined" color="error">
          Delete Page
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {/* MAIN INFO */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Page Information
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <Typography>Key: {page.key}</Typography>
              <Typography>Template Key: {page.template_key}</Typography>
              <Typography>Template Name: {page.template_name}</Typography>

              <Typography variant="body2" color="text.secondary">
                Created: {new Date(page.created_at).toLocaleString()}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Updated: {new Date(page.updated_at).toLocaleString()}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* PREVIEW AREA */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Page Preview
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                height: 250,
                borderRadius: 2,
                backgroundColor: "#f3f3f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #ccc",
              }}
            >
              <Typography color="text.secondary">
                Image Preview (coming soon)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
      {/* SECTIONS */}
      <Card
        sx={{
          mt: 4,
          p: 2,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-evenly", my: 3 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Page Sections
            </Typography>
            <AddButton
              label="Section"
              to={`/admin/create-section/${page.id}`}
            />
          </Box>
          {/* EMPTY STATE */}
          {(!sections || sections.length === 0) && (
            <Box
              sx={{
                mt: 3,
                py: 5,
                textAlign: "center",
                border: "1px dashed #ccc",
                borderRadius: 2,
                backgroundColor: "#fafafa",
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                No sections yet
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                This page doesn’t contain any sections. Start by creating one.
              </Typography>
            </Box>
          )}

          {/* LIST */}
          {sections?.length > 0 && (
            <Grid container spacing={3} mt={1}>
              {sections.map((section) => (
                <Grid
                  size={{ xs: 12, md: 4, lg: 6 }}
                  key={section.id}
                  sx={{ alignItems: "center" }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "0.2s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    {/* HEADER */}
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        my: 3,
                      }}
                    >
                      <Typography variant="h6" fontWeight={800}>
                        {section.type.toUpperCase()}
                      </Typography>

                      <Chip
                        label={section.is_visible ? "VISIBLE" : "HIDDEN"}
                        color={section.is_visible ? "success" : "default"}
                        size="large"
                      />
                    </Stack>

                    {/* INFO */}
                    <Stack spacing={1}>
                      <Typography variant="body1">
                        <strong>Position:</strong> {section.position}
                      </Typography>

                      <Typography variant="body1">
                        <strong>Type:</strong> {section.type}
                      </Typography>
                    </Stack>

                    {/* PREVIEW PLACEHOLDER */}
                    <Box
                      sx={{
                        mt: 2,
                        height: 120,
                        borderRadius: 2,
                        border: "1px dashed #ccc",
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        Section Preview
                      </Typography>
                    </Box>

                    {/* ACTIONS */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "center", my: 3 }}
                    >
                      <Button size="small" variant="contained">
                        Edit
                      </Button>

                      <Button size="small" variant="outlined">
                        Preview
                      </Button>

                      <Button size="small" color="error" variant="outlined">
                        Delete
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
