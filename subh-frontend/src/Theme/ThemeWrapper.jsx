import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useLanguage } from "../Context/LanguageContext";
import { getTheme } from "./Theme";

export default function ThemeWrapper({ children }) {
  const { language } = useLanguage();

  const theme = getTheme(language);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
