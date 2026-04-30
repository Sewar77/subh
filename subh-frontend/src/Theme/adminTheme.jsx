import { createTheme } from "@mui/material/styles";

export const adminTheme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#8b5cf6",
    },

    secondary: {
      main: "#22c55e",
    },

    error: {
      main: "#ef4444",
    },

    warning: {
      main: "#f59e0b",
    },

    info: {
      main: "#38bdf8",
    },

    background: {
      default: "#69839c",
    },

    text: {
      primary: "#f1f5f9",
      secondary: "#1e293b",
    },

    divider: "rgba(148, 163, 184, 0.2)",
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#020617",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "6px 14px",
        },
        containedPrimary: {
          boxShadow: "none",
          ":hover": {
            boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          color: "#020617",
          borderRadius: 6,
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": {
            borderColor: "rgba(148,163,184,0.2)",
          },
          "&:hover fieldset": {
            borderColor: "#8b5cf6",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#8b5cf6",
            borderWidth: "1px",
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(148,163,184,0.1)",
        },
        head: {
          color: "#94a3b8",
          fontWeight: 600,
        },
      },
    },
  },
});
