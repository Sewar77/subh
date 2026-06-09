import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Divider,
  Container,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import Title from "../../Headers/Titles";

export default function CreateSection() {
  const { pageId } = useParams();
  const { fetchPageById, page, addSection, getSectionsByPageId, sections } =
    usePages();
  const [form, setForm] = useState({
    type: "",
  });
  useEffect(() => {
    fetchPageById(pageId);
    getSectionsByPageId(pageId);
  }, [pageId]);
  const handleCreate = async () => {
    const nextPosition = (page?.sections?.length || 0) + 1;
    await addSection(pageId, {
      type: form.type,
      position: nextPosition,
    });
    setForm({ type: "" });
    fetchPageById(pageId);
    getSectionsByPageId(pageId);
  };

  return (
    <Container>
      <Box sx={{ p: 4 }}>
        {/* HEADER */}

        <Title
          title={"Create New Section"}
          caption={`Page: ${page?.key} (${page?.template_name})`}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2 }}
        ></Typography>

        <Divider sx={{ mb: 3 }} />

        {/* INFO CARD */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              What is a section?
            </Typography>

            <Typography color="text.secondary">
              A section is a building block of the page. It controls how content
              appears. You cannot write free-form content here — only structured
              blocks like:
            </Typography>

            <ul>
              <li>Hero (top banner)</li>
              <li>Text block</li>
              <li>Image block</li>
              <li>Image + Text layout</li>
            </ul>
          </CardContent>
        </Card>

        {/* FORM */}
        <Card>
          <CardContent>
            <TextField
              select
              fullWidth
              label="Section Type"
              value={form.type}
              onChange={(e) => setForm({ type: e.target.value })}
            >
              <MenuItem value="hero">Hero Section</MenuItem>
              <MenuItem value="text">Text Block</MenuItem>
              <MenuItem value="image">Image Block</MenuItem>
              <MenuItem value="image_text">Image + Text</MenuItem>
              <MenuItem value="text_image">Text + Image</MenuItem>
            </TextField>

            <Typography sx={{ mt: 2 }} color="text.secondary">
              Position will be automatically set to the next available slot.
            </Typography>

            <Button
              sx={{ mt: 3 }}
              variant="contained"
              disabled={!form.type}
              onClick={handleCreate}
            >
              Create Section
            </Button>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ mt: 5, display: "flex", flexDirection: "column", gap: 3 }}>
        {sections
          ?.sort((a, b) => a.position - b.position)
          .map((section) => (
            <Card
              key={section.id}
              sx={{
                p: 2,
                borderRadius: 3,
                display: "flex",
                gap: 3,
                alignItems: "center",
              }}
            >
              {/* VISUAL PREVIEW */}
              <Box
                sx={{
                  width: 140,
                  height: 100,
                  borderRadius: 2,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#666",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {section.type === "text" && "Text Block Preview"}
                {section.type === "image" && "Image Block Preview"}
                {section.type === "hero" && "Hero Section Preview"}
                {section.type === "image_text" && "Image + Text"}
                {section.type === "text_image" && "Text + Image"}
              </Box>

              {/* INFO */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  {section.type.replace("_", " ").toUpperCase()}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Position: #{section.position}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Section ID: {section.id}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Visibility: {section.is_visible ? "Visible" : "Hidden"}
                </Typography>

                {/* FAKE CONTENT INFO */}
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1, color: "#888" }}
                >
                  This block controls how content will appear on the About page.
                </Typography>
              </Box>

              {/* ACTIONS */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button size="small" variant="contained">
                  Edit
                </Button>

                <Button size="small" variant="outlined">
                  {section.is_visible ? "Hide" : "Show"}
                </Button>

                <Button size="small" color="error" variant="outlined">
                  Delete
                </Button>
              </Box>
            </Card>
          ))}
      </Box>
    </Container>
  );
}
