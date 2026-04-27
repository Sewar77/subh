import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#613389",
      secondary: "#d9d6e6",
    },

    secondary: {
      main: "#bb40bf",
    },

    success: {
      main: "#41f2c3",
    },

    background: {
      default: "#d9d6e6",
      paper: "#613389",
    },

    text: {
      primary: "#102943",
      secondary: "rgba(255,255,255,0.7)",
    },
    custom: {
      gradients: {
        primary: `linear-gradient(
        90deg,
        #bb40bf 10%,
        #102943 40%, 
        #613389 70%
      )`,
        aurora: `linear-gradient(
        90deg,
        rgba(187,64,191,0.2),
        rgba(97,51,137,0.15),
        rgba(65,242,195,0.2)
      )`,
      },
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
        },
      },
    },
  },
});
