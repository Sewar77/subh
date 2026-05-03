import { createTheme } from "@mui/material/styles";

export const adminTheme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#6366f1",
    },

    secondary: {
      main: "#0ea5e9",
    },

    background: {
      default: "#f1f5f9",
      paper: "#ffffff",
    },

    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f1f5f9",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          backgroundImage: "none",
        },
      },
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#0f172a",

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(15, 23, 42, 0.15)",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6366f1",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6366f1",
          },
        },

        input: {
          color: "#0f172a",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#64748b",

          "&.Mui-focused": {
            color: "#6366f1",
          },
        },
      },
    },
  },
});
