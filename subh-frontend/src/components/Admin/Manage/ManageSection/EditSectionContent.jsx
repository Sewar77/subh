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
} from "@mui/material";
import { useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import Title from "../../Headers/Titles";

export default function EditSectionContent() {
  const { sectionId } = useParams();

  const {
    getSectionTranslations,
    updateSectionTranslation,
    sectionTranslations,
  } = usePages();

  const [enContent, setEnContent] = useState({});
  const [arContent, setArContent] = useState({});

  useEffect(() => {
    if (sectionId) {
      getSectionTranslations(sectionId);
    }
  }, [sectionId]);

  useEffect(() => {
    const en = sectionTranslations.find((t) => t.locale === "en");

    const ar = sectionTranslations.find((t) => t.locale === "ar");

    if (en) setEnContent(en.content || {});
    if (ar) setArContent(ar.content || {});
  }, [sectionTranslations]);

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

  const renderFields = (content, setContent) =>
    Object.entries(content).map(([key, value]) => (
      <TextField
        key={key}
        label={key}
        value={value}
        multiline
        minRows={3}
        fullWidth
        onChange={(e) =>
          setContent({
            ...content,
            [key]: e.target.value,
          })
        }
        sx={{
          mb: 2,
        }}
      />
    ));

  return (
    <Box
      sx={{
        p: 4,
      }}
    >
      <Title
        title="Edit Section Content"
        caption="Modify only the translated content of this section."
      />

      <Stack spacing={3} mt={4}>
        <Card>
          <CardContent
            sx={{
              p: 4,
            }}
          >
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

            {renderFields(enContent, setEnContent)}
          </CardContent>
        </Card>

        <Card
          sx={{
            direction: "rtl",
          }}
        >
          <CardContent
            sx={{
              p: 4,
            }}
          >
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

            {renderFields(arContent, setArContent)}
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
