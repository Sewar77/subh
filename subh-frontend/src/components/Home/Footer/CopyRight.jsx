import { Typography } from "@mui/material";
import { useLanguage } from "../../../Context/LanguageContext";
import { footerTranslations } from "../../../locales/footerTranlsations";

export default function CopyRight() {
  const { language } = useLanguage();
  const t = footerTranslations[language];

  return (
    <Typography>
      {t.copyright} || {t.year}
    </Typography>
  );
}
