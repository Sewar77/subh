import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { usePages } from "../../../../Context/pageContext";
import ViewButton from "../../Buttons/ViewBtn.jsx";
import Title from "../../Headers/Titles.jsx";

export default function CreatePage() {
  const navigate = useNavigate();
  const {
    createPage,
    templatePages,
    fetchPageByTemplateId,
    getTemplateById,
    template,
  } = usePages();
  const { templateId } = useParams();
  const [form, setForm] = useState({
    key: "",
  });
  useEffect(() => {
    fetchPageByTemplateId(templateId);
    getTemplateById(templateId);
  }, [templateId]);

  const handleSubmit = async () => {
    await createPage({
      template_id: templateId,
      key: form.key,
    });
    setForm({
      key: "",
    });
    await fetchPageByTemplateId(templateId);
  };

  return (
    <Container sx={{ justifyContent: "center", p: 3 }} p={4}>
      <Title
        title={"Create New Page"}
        caption={"Create a new website page using the selected template."}
      />
      <Alert
        severity="info"
        sx={{ mb: 4, textAlign: "center", justifyContent: "center" }}
      >
        You are creating a page from a template. After creating the page you
        will be able to:
        <br />
        • Add page titles and translations
        <br />
        • Build page sections
        <br />
        • Upload images and content
        <br />• Publish the page to the website
      </Alert>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Selected Template
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Typography variant="body1">
              You are creating page that follows the: {template?.name}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            The New Page Information
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter a unique internal page name. This name is only used inside the
            administration panel to identify the page.
          </Typography>

          <TextField
            fullWidth
            label="Internal Page Name"
            placeholder="ex: about-company"
            value={form.key}
            onChange={(e) =>
              setForm({
                ...form,
                key: e.target.value,
              })
            }
          />

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1 }}
          >
            Examples: about-company, home-banner, contact-page
          </Typography>

          <Box mt={4}>
            <Button variant="contained" onClick={handleSubmit}>
              Create Page
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            What Happens Next?
          </Typography>

          <Typography variant="body2" color="text.secondary">
            After creating the page, the recommended workflow is:
            <br />
            <br />
            1. Add English and Arabic translations.
            <br />
            2. Create page sections.
            <br />
            3. Fill each section with content.
            <br />
            4. Upload images and media.
            <br />
            5. Preview the page.
            <br />
            6. Publish when ready.
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ mt: 4, p: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              textAlign: "center",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Pages in this Template
            </Typography>

            <Chip
              label={`Total: ${templatePages?.length || 0}`}
              color="primary"
              size="large"
            />
          </Stack>

          {/* EMPTY STATE */}
          {(!templatePages || templatePages.length === 0) && (
            <Box
              sx={{
                mt: 3,
                py: 6,
                textAlign: "center",
                border: "1px dashed #ccc",
                borderRadius: 2,
                backgroundColor: "#fafafa",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                No pages yet
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                This template doesn’t have any pages created yet.
              </Typography>
            </Box>
          )}

          {/* GRID LIST */}
          {templatePages?.length > 0 && (
            <Grid container spacing={2} mt={4}>
              {templatePages.map((page) => (
                <Grid
                  size={{ xs: 12, md: 4, lg: 6 }}
                  key={page.id}
                  sx={{ textAlign: "center" }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      transition: "0.2s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Stack
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {page.key}
                      </Typography>

                      <Chip
                        label={page.status}
                        color={page.status === "draft" ? "warning" : "success"}
                        size="small"
                      />
                    </Stack>
                    <ViewButton
                      onClick={() => {
                        navigate(`/admin/view-page/${page.id}`);
                      }}
                    >
                      View
                    </ViewButton>
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
