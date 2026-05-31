import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages.js";

export default function CreatePage() {
  const { createPage } = usePages();
  const { state } = useLocation();
  const template = state?.template;
  const [form, setForm] = useState({
    key: "",
  });
  const handleSubmit = async () => {
    await createPage({
      template_id: template.id,
      key: form.key,
    });
    setForm({
      key: "",
    });
  };

  return (
    <Container sx={{ justifyContent: "center", p: 3 }} p={4}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Create New Page
      </Typography>

      <Typography variant="h6" color="text.secondary" mb={4}>
        Create a new website page using the selected template.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
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
    </Container>
  );
}
