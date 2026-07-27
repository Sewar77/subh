import { createTheme } from "@mui/material";

const colors = {
  navy: "#071a35",
  navyLight: "#102943",
  cyan: "#24bec8",
  cyanLight: "#62d8df",
  magenta: "#a34ca8",
  purple: "#613389",
  surface: "#ffffff",
  background: "#f4f7fb",
};

export const getTheme = (language) =>
  createTheme({
    palette: {
      mode: "light",
      primary: { main: colors.purple, contrastText: "#ffffff" },
      secondary: { main: colors.cyan, contrastText: colors.navy },
      success: { main: colors.cyan },
      background: { default: colors.background, paper: colors.surface },
      text: { primary: colors.navy, secondary: "#52647b" },
    },
    typography: {
      fontFamily:
        language === "ar" ? "DG Faseh, sans-serif" : "Montserrat, sans-serif",
      h1: { fontWeight: 800, letterSpacing: "-0.035em" },
      h2: { fontWeight: 800, letterSpacing: "-0.025em" },
      h3: { fontWeight: 750, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: "linear-gradient(180deg, #f8fbff 0%, #edf3fa 100%)",
          },
          "*:focus-visible": {
            outline: `3px solid ${colors.cyanLight}`,
            outlineOffset: 3,
          },
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              scrollBehavior: "auto !important",
              transitionDuration: "0.01ms !important",
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: 44, borderRadius: 12, paddingInline: 20 },
          containedPrimary: {
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.magenta})`,
            "&:hover": {
              background: `linear-gradient(135deg, ${colors.navyLight}, ${colors.purple})`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(16, 41, 67, 0.09)",
            boxShadow: "0 10px 28px rgba(7, 26, 53, 0.08)",
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
    },
  });
