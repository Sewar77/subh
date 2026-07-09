import { useEffect, useState } from "react";
import { Box, Typography, Stack, Card, CardContent } from "@mui/material";
import { usePages } from "../../Hooks/usePages";
import SectionRenderer from "../../cms/SectionRenderer";

export default function About() {
  const {
    page,
    sections,
    fetchPageByKey,
    getSectionsByPageId,
    getSectionTranslationsBySectionId,
  } = usePages();

  const [hydratedSections, setHydratedSections] = useState([]);

  // 1. Load page
  useEffect(() => {
    fetchPageByKey("about-page");
  }, []);

  // 2. Load sections
  useEffect(() => {
    if (page?.id) {
      getSectionsByPageId(page.id);
    }
  }, [page?.id]);

  // 3. Merge translations INTO sections
  useEffect(() => {
    if (!sections?.length) return;

    const load = async () => {
      const enriched = await Promise.all(
        sections.map(async (section) => {
          const res = await getSectionTranslationsBySectionId(section.id);

          ("section id:", section.id);
          ("translations:", res);

          return {
            ...section,
            translations: res || [],
          };
        }),
      );

      setHydratedSections(enriched);
    };

    load();
  }, [sections]);

  // 4. Get localized section
  const getLocalizedSection = (section, locale = "en") => {
    const trans = section.translations || [];
    const active = trans.find((t) => t.locale === locale);

    ("active translation:", active);

    return {
      ...section,
      title: active?.title || "",
      content: active?.content?.text || "",
    };
  };

  // 5. normalize types
  const normalizeType = (type) => {
    if (type === "text_image") return "image_text";
    return type;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ fontSize: "2.5rem", fontWeight: 800 }}>
        {page?.title || "About Subh"}
      </Typography>

      <Stack spacing={5}>
        {sections
          ?.sort((a, b) => a.position - b.position)
          .map((section) => (
            <Card key={section.id}>
              <CardContent>
                <SectionRenderer
                  section={getLocalizedSection(
                    {
                      ...section,
                      type: normalizeType(section.type),
                    },
                    "en",
                  )}
                />
              </CardContent>
            </Card>
          ))}
      </Stack>
    </Box>
  );
}
