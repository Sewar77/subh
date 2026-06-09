import { useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
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
  Divider,
  Alert,
} from "@mui/material";
import Title from "../../Headers/Titles";

export default function EditPage() {
  const { pageId } = useParams();

  const { fetchPageById, page, updatePage, fetchTemplates, templates } =
    usePages();

  const [form, setForm] = useState({
    key: "",
    status: "",
    template_key: "",
  });

  useEffect(() => {
    if (pageId) {
      fetchPageById(pageId);
      fetchTemplates();
    }
  }, [pageId]);

  useEffect(() => {
    if (page) {
      setForm({
        key: page.key || "",
        status: page.status || "",
        template_key: page.template_key || "",
      });
    }
  }, [page]);

  // 🎯 resolve template key → template id
  const selectedTemplateId = useMemo(() => {
    return templates?.find((t) => t.key === form.template_key)?.id;
  }, [form.template_key, templates]);

  const isValid = useMemo(() => {
    return form.key.trim().length > 0 && !!form.template_key;
  }, [form]);

  const handleSubmit = async () => {
    if (!isValid) return;

    await updatePage(pageId, {
      key: form.key,
      status: form.status,
      template_id: selectedTemplateId,
    });
  };

  return (
    <Container sx={{ py: 6, maxWidth: "900px !important" }}>
      {/* HEADER */}
      <Title
        title={"Page Editor"}
        caption={"Manage page identity + template binding safely."}
      />
      {/* ADMIN GUIDE */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography fontWeight={800} sx={{ fontSize: "1.05rem" }}>
          What you should know
        </Typography>

        <Typography sx={{ mt: 1, lineHeight: 1.7, textAlign: "left" }}>
          • This “Page Key” is the page’s name used inside the system (like an
          ID badge, not shown for users)
          <br />• Page key should be like this : page-key, no spaces, at least 2
          letters.
          <br />• Numbers allowed
          <br />• Choose a template from the list — it controls how the page
          looks
          <br />• If you change the template, the page design will change
          automatically
        </Typography>
      </Alert>

      {/* META */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={800}>
            System Metadata
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`ID: ${page?.id || "-"}`} />
            <Chip
              label={`Created: ${new Date(page?.created_at).toLocaleDateString() || "-"}`}
            />
            <Chip
              label={`Updated: ${new Date(page?.updated_at).toLocaleDateString() || "-"}`}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* FORM */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
            Editable Fields
          </Typography>

          <Stack spacing={2.5}>
            {/* PAGE KEY */}
            <TextField
              label="Page Key"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              fullWidth
              sx={{ "& input": { fontSize: "1.1rem" } }}
            />

            {/* STATUS */}
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </TextField>

            {/* TEMPLATE SELECTOR (IMPORTANT PART) */}
            <TextField
              select
              label="Template (choose by key)"
              value={form.template_key}
              onChange={(e) =>
                setForm({ ...form, template_key: e.target.value })
              }
              fullWidth
            >
              {templates?.map((t) => (
                <MenuItem key={t.id} value={t.key}>
                  {t.name} ({t.key})
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              size="large"
              disabled={!isValid}
              onClick={handleSubmit}
              sx={{
                fontWeight: 800,
                py: 1.5,
                fontSize: "1.05rem",
              }}
            >
              Save Page Changes
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
