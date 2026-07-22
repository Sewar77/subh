import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { usePages } from "../../../../Context/pageContext";
import { useUpload } from "../../../../Hooks/useUpload";
import Title from "../../Headers/Titles";

export default function EditSectionContent() {
  const { sectionId } = useParams();

  const {
    getSectionTranslations,
    updateSectionTranslation,
    sectionTranslations,
    fetchSectionById,
  } = usePages();

  const enUpload = useUpload();
  const arUpload = useUpload();

  const [enContent, setEnContent] = useState({});
  const [arContent, setArContent] = useState({});

  const [enPreview, setEnPreview] = useState("");
  const [arPreview, setArPreview] = useState("");

  useEffect(() => {
    if (sectionId) {
      fetchSectionById(sectionId);
      getSectionTranslations(sectionId);
    }
  }, [sectionId, fetchSectionById, getSectionTranslations]);

  useEffect(() => {
    const en = sectionTranslations.find((t) => t.locale === "en");
    const ar = sectionTranslations.find((t) => t.locale === "ar");

    setEnContent(en?.content || {});
    setArContent(ar?.content || {});

    setEnPreview(en?.content?.image || "");
    setArPreview(ar?.content?.image || "");
  }, [sectionTranslations]);

  const handleImageChange = (event, setPreview) => {
    const file = event.target.files?.[0];
    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return null;
    }

    setPreview(URL.createObjectURL(file));
    return file;
  };

  const handleImageUpload = async ({
    file,
    uploader,
    content,
    setContent,
    setPreview,
  }) => {
    if (!file) return;

    await uploader.uploadImage(file);

    if (uploader.uploadedUrl) {
      setContent({
        ...content,
        image: uploader.uploadedUrl,
      });

      setPreview(uploader.uploadedUrl);
      toast.success("Image uploaded successfully");
    }
  };

  const handleSave = async () => {
    const en = sectionTranslations.find((t) => t.locale === "en");
    const ar = sectionTranslations.find((t) => t.locale === "ar");

    if (en) {
      await updateSectionTranslation(en.id, {
        content: enContent,
      });
    }

    if (ar) {
      await updateSectionTranslation(ar.id, {
        content: arContent,
      });
    }
  };

  const renderFields = (
    content,
    setContent,
    preview,
    setPreview,
    uploader,
    locale,
  ) =>
    Object.entries(content).map(([key, value]) => {
      if (key === "image") {
        return (
          <Box key={key} sx={{ mb: 3 }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Image
            </Typography>

            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: "100%",
                  maxWidth: 280,
                  maxHeight: 200,
                  objectFit: "cover",
                  borderRadius: 2,
                  mb: 2,
                  border: "1px solid #ddd",
                }}
              />
            )}

            <Button variant="outlined" component="label">
              Choose Image
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = handleImageChange(e, setPreview);

                  if (file) {
                    await handleImageUpload({
                      file,
                      uploader,
                      content,
                      setContent,
                      setPreview,
                    });
                  }
                }}
              />
            </Button>

            {uploader.loading && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress size={22} />
              </Box>
            )}

            {uploader.error && (
              <Typography sx={{ mt: 1, color: "red" }}>
                {uploader.error}
              </Typography>
            )}
          </Box>
        );
      }

      return (
        <TextField
          key={key}
          label={key}
          value={value || ""}
          multiline
          minRows={3}
          fullWidth
          onChange={(e) =>
            setContent({
              ...content,
              [key]: e.target.value,
            })
          }
          sx={{ mb: 2 }}
        />
      );
    });

  return (
    <Box sx={{ p: 4 }}>
      <Title
        title="Edit Section Content"
        caption="Modify translated content and upload media."
      />

      <Stack spacing={3} mt={4}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography
              sx={{
                fontSize: "1.8rem",
                fontWeight: 900,
                mb: 2,
              }}
            >
              English Content
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {renderFields(
              enContent,
              setEnContent,
              enPreview,
              setEnPreview,
              enUpload,
              "en",
            )}
          </CardContent>
        </Card>

        <Card sx={{ direction: "rtl" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              sx={{
                fontSize: "1.8rem",
                fontWeight: 900,
                mb: 2,
              }}
            >
              المحتوى العربي
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {renderFields(
              arContent,
              setArContent,
              arPreview,
              setArPreview,
              arUpload,
              "ar",
            )}
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          sx={{
            fontSize: "1.2rem",
            py: 1.5,
          }}
        >
          Save Content
        </Button>
      </Stack>
    </Box>
  );
}
