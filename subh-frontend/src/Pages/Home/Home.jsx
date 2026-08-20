import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";

import SectionRenderer from "../../cms/SectionRenderer";
import { useLanguage } from "../../Context/LanguageContext";

import { usePages } from "../../Context/pageContext";

export default function Home() {
  const { getSectionsByPageKey, sectionKey } = usePages();

  const { language } = useLanguage();

  useEffect(() => {
    getSectionsByPageKey("home-page", language);
  }, [getSectionsByPageKey, language]);

  const sections = useMemo(() => {
    return [...(sectionKey || [])]
      .sort((a, b) => a.position - b.position)
      .filter((section) => section && section.templateKey);
  }, [sectionKey]);
  return (
    <Box sx={{ direction: language === "ar" ? "rtl" : "ltr", display: "grid", minWidth: 0 }}>
      {sections.map((section, index) => (
        <SectionRenderer
          key={section.id}
          section={section}
          priority={index === 0}
        />
      ))}
    </Box>
  );
}
