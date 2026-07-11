import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";

import SectionRenderer from "../../cms/SectionRenderer";
import { usePages } from "../../Hooks/usePages";
import { useLanguage } from "../../Context/LanguageContext";
import { prepareSection } from "../../Utils/sectionAdapter";

import Navbar from "../../components/Home/Navbar/Navbar";
import Footer from "../../components/Home/Footer/Footer";

export default function Home() {
  const { getSectionsByPageKey, sectionKey } = usePages();

  const { language } = useLanguage();

  useEffect(() => {
    getSectionsByPageKey("home-page");
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
      }}
    >
      <Navbar />

      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <Footer />
    </Box>
  );
}
