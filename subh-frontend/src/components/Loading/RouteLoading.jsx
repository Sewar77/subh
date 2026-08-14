import { Box, CircularProgress, Typography } from "@mui/material";
import { useLanguage } from "../../Context/LanguageContext.jsx";

const loadingCopy = {
  en: "Loading page…",
  ar: "جارٍ تحميل الصفحة…",
};

export default function RouteLoading({ fullPage = false }) {
  const { language } = useLanguage();

  return (
    <Box
      role="status"
      aria-live="polite"
      dir={language === "ar" ? "rtl" : "ltr"}
      sx={{
        minHeight: fullPage ? "100svh" : { xs: 280, md: 420 },
        width: "100%",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={36} />
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          {loadingCopy[language] || loadingCopy.en}
        </Typography>
      </Box>
    </Box>
  );
}
