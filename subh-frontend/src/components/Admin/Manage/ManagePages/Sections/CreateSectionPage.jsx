import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useSections } from "../../../../../Hooks/useSections";

export default function CreateSectionPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { createSection } = useSections();

  const [type, setType] = useState("");

  const [title, setTitle] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [media, setMedia] = useState("");

  const handleCreate = async () => {
    const settings = {
      title: title || null,
      paragraph: paragraph || null,
      media: media || null,
    };

    await createSection(pageId, {
      type: type || "custom",
      settings,
    });

    navigate(-1);
  };

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 700 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Create Section
        </Typography>

        <Stack spacing={2}>
          {/* TYPE (FREE INPUT) */}
          <TextField
            label="Section Type (e.g. title, paragraph, media)"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
          />

          {/* TITLE */}
          <TextField
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          {/* PARAGRAPH */}
          <TextField
            label="Paragraph (optional)"
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
            fullWidth
            multiline
            rows={5}
          />

          {/* MEDIA */}
          <TextField
            label="Media URL (optional)"
            value={media}
            onChange={(e) => setMedia(e.target.value)}
            fullWidth
            helperText="Image / video / file URL"
          />
          <Button variant="contained" fullWidth onClick={handleCreate}>
            Create Section
          </Button>

          <Button variant="outlined" fullWidth onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
