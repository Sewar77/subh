import { Box, Typography } from "@mui/material";
import { useLanguage } from "../../../Context/LanguageContext";
import { footerTranslations } from "../../../locales/footerTranlsations";

export default function Pages() {
  const { language } = useLanguage();
  const t = footerTranslations[language];

  const pages = [
    t.home,
    t.programs,
    t.resources,
    t.workshops,
    t.about,
    t.contact,
  ];

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          position: "relative",
          display: "inline-block",
          fontWeight: 700,
          mb: 2,
          "&::after": {
            content: '""',
            position: "absolute",
            left: 0,
            bottom: -6,
            width: "100%",
            height: "4px",
            borderRadius: "4px",
            background: "linear-gradient(90deg,#41f2c3,#102943)",
          },
        }}
      >
        {t.pages}
      </Typography>

      {pages.map((page) => (
        <Typography key={page}>{page}</Typography>
      ))}
    </Box>
  );
}
