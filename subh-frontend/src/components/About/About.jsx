import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";

import { useLanguage } from "../../Context/LanguageContext";

import SectionRenderer from "../../cms/SectionRenderer";
import { prepareSection } from "../../Utils/sectionAdapter";
import { usePages } from "../../Context/pageContext";

export default function About() {
  const { getSectionsByPageKey, sectionKey, sectionsLoading } = usePages();
  const { language } = useLanguage();

  useEffect(() => {
    getSectionsByPageKey("about-page");
  }, []);

  const sections = useMemo(() => {
    return (sectionKey || [])

      .filter((section) => section.is_visible)

      .sort((a, b) => a.position - b.position)

      .map((section) => prepareSection(section, language))

      .filter(Boolean);
  }, [sectionKey, language]);

  return (
    <Box
      sx={{
        direction: language === "ar" ? "rtl" : "ltr",
        minHeight: "100vh",
      }}
    >
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </Box>
  );
}
