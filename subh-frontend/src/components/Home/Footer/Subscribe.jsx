import { Box, Button, FormControl, TextField, Typography } from "@mui/material";
import { useLanguage } from "../../../Context/LanguageContext";
import { footerTranslations } from "../../../locales/footerTranlsations";

export default function Subscribe() {
  const { language } = useLanguage();
  const t = footerTranslations[language];

  return (
    <Box
      sx={{
        direction: language === "ar" ? "rtl" : "ltr",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          position: "relative",
          display: "inline-block",
          fontWeight: 700,
          mb: 2,
          "&::after": {
            mx: "auto",
            content: '""',
            position: "absolute",
            left: 0,
            bottom: -6,
            width: "100%",
            height: "4px",
            borderRadius: "4px",
            background: "linear-gradient(90deg, #41f2c3, #102943)",
          },
        }}
      >
        {t.subscribe}
      </Typography>

      <Typography variant="body2">{t.latestNews}</Typography>

      <FormControl
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          mx: "auto",
          mt: 2,
        }}
      >
        <TextField
          label={t.emailPlaceholder}
          sx={{
            bgcolor: "primary.secondary",
            borderRadius: 1,
            color: "success.main",
          }}
        />

        <Button type="submit" variant="contained">
          {t.send}
        </Button>
      </FormControl>
    </Box>
  );
}
