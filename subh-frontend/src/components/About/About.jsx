import { useEffect } from "react";
import { Box, Typography, Stack, Card, CardContent } from "@mui/material";
import { usePages } from "../../Hooks/usePages";

export default function About() {
  const { page, sections, fetchPageByKey, getSectionsByPageId } = usePages();

  useEffect(() => {
    fetchPageByKey("about");
  }, []);

  useEffect(() => {
    if (page?.id) {
      getSectionsByPageId(page.id);
    }
  }, [page?.id]);

  const renderSection = (section) => {
    switch (section.type) {
      case "image":
        return (
          <Box
            sx={{
              width: "100%",
              height: 300,
              background: "#eee",
              borderRadius: 2,
            }}
          >
            <Typography>Image Block</Typography>
          </Box>
        );

      case "text":
        return (
          <Typography variant="body1" sx={{ fontSize: 18, lineHeight: 1.8 }}>
            This is a text block. Content comes from section_translations JSON.
          </Typography>
        );

      case "image_text":
        return (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1, height: 200, background: "#ddd" }}>Image</Box>
            <Box sx={{ flex: 1 }}>
              <Typography>Text next to image</Typography>
            </Box>
          </Stack>
        );

      case "text_image":
        return (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography>Text first</Typography>
            </Box>
            <Box sx={{ flex: 1, height: 200, background: "#ddd" }}>
              Image second
            </Box>
          </Stack>
        );

      default:
        return <Typography>Unknown section</Typography>;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* PAGE HEADER */}
      <Typography variant="h3" fontWeight={700}>
        {page?.title || "About Us"}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        {page?.description || "Learn more about who we are"}
      </Typography>

      {/* SECTIONS */}
      <Stack spacing={4}>
        {sections
          ?.sort((a, b) => a.position - b.position)
          .map((section) => (
            <Card key={section.id} sx={{ p: 2 }}>
              <CardContent>{renderSection(section)}</CardContent>
            </Card>
          ))}
      </Stack>
    </Box>
  );
}
