import { Box, Typography } from "@mui/material";
import { useLanguage } from "../../../Context/LanguageContext";
import { footerTranslations } from "../../../locales/footerTranlsations";

export default function ConnectInfo() {
  const { language } = useLanguage();
  const t = footerTranslations[language];

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
        {t.stayConnected}
      </Typography>

      <Typography variant="body2">contact@subh.com</Typography>

      <Typography variant="body2" sx={{ mt: 2 }}>
        +1-215456-7890
      </Typography>
    </Box>
  );
}
