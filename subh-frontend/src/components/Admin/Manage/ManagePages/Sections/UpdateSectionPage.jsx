import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  MenuItem,
} from "@mui/material";

import { useSections } from "../../../../../Hooks/useSections";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateSectionPage() {
  const { sectionId, pageId } = useParams();
  const navigate = useNavigate();

  const { fetchSectionById, updatedSectionPage, section } = useSections();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [mediaType, setMediaType] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (sectionId) fetchSectionById(sectionId);
  }, [sectionId]);

  useEffect(() => {
    if (!section) return;

    const s = section.settings || {};

    setTitle(s.title || "");
    setText(s.text || "");

    setMediaType(s.media?.type || "");
    setMediaUrl(s.media?.url || "");

    setIsVisible(section.is_visible);
  }, [section]);

  const handleSave = async () => {
    await updatedSectionPage(
      sectionId,
      {
        type: "text",
        settings: {
          title: title.trim() || null,
          text: text.trim() || null,
          media: mediaUrl.trim()
            ? {
                type: mediaType || "image",
                url: mediaUrl.trim(),
              }
            : null,
        },
        is_visible: isVisible,
      },
      pageId,
    );

    navigate(-1);
  };

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 700, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Edit Content Section
        </Typography>

        <Stack spacing={2}>
          {/* TITLE */}
          <TextField
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          {/* TEXT */}
          <TextField
            label="Text (optional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            multiline
            rows={5}
          />

          {/* MEDIA TYPE */}
          <TextField
            select
            label="Media Type (optional)"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            fullWidth
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="image">Image</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="file">File</MenuItem>
          </TextField>

          {/* MEDIA URL */}
          <TextField
            label="Media URL (optional)"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            fullWidth
          />

          {/* VISIBILITY */}
          <FormControlLabel
            control={
              <Switch
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
              />
            }
            label={isVisible ? "Visible" : "Hidden"}
          />

          {/* SAVE */}
          <Button variant="contained" fullWidth onClick={handleSave}>
            Save Changes
          </Button>

          <Button variant="outlined" fullWidth onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
