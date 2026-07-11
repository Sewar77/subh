import { Box, Typography } from "@mui/material";
import { useLanguage } from "../../../Context/LanguageContext";
import { footerTranslations } from "../../../locales/footerTranlsations";

export default function Info() {
  const { language } = useLanguage();
  const t = footerTranslations[language];

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          display: "inline-block",
        }}
      >
        <Box component="img" src="/subhlogo.png" width="50rem" />

        <Box
          sx={{
            position: "absolute",
            left: 0,
            bottom: -6,
            width: "100%",
            height: "4px",
            borderRadius: "4px",
            background: "linear-gradient(90deg,#41f2c3,#102943)",
          }}
        />
      </Box>

      <Typography
        variant="body1"
        sx={{
          mt: 2,
          direction: language === "ar" ? "rtl" : "ltr",
        }}
      >
        {t.description}
      </Typography>
    </Box>
  );
}
