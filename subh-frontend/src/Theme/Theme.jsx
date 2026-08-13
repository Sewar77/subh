import { createTheme, alpha } from "@mui/material/styles";

export const getTheme = (language) =>
  createTheme({
    direction: language === "ar" ? "rtl" : "ltr",

    typography: {
      fontFamily:
        language === "ar"
          ? '"DG Faseh", "Tahoma", sans-serif'
          : '"Montserrat", "Inter", sans-serif',

      h1: {
        fontWeight: 800,
        letterSpacing: "-0.04em",
      },

      h2: {
        fontWeight: 800,
        letterSpacing: "-0.03em",
      },

      h3: {
        fontWeight: 750,
      },

      h4: {
        fontWeight: 700,
      },

      body1: {
        lineHeight: 1.8,
      },

      body2: {
        lineHeight: 1.7,
      },

      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },

    palette: {
      mode: "light",

      primary: {
        main: "#6546A3",
        light: "#8B71C7",
        dark: "#463071",
        contrastText: "#FFFFFF",
      },

      secondary: {
        main: "#C052A9",
        light: "#DA84C9",
        dark: "#8B387B",
        contrastText: "#FFFFFF",
      },

      success: {
        main: "#55C9B5",
        light: "#88E0D1",
        dark: "#2F8D7E",
      },

      info: {
        main: "#65BFD2",
        light: "#A7DFE8",
        dark: "#3C8899",
      },

      warning: {
        main: "#E8B46B",
      },

      error: {
        main: "#D66079",
      },

      background: {
        default: "#F6F4FA",
        paper: "#FFFFFF",
      },

      text: {
        primary: "#241D38",
        secondary: "#6F687F",
        disabled: "#A9A3B4",
      },

      divider: "rgba(76, 57, 107, 0.10)",
    },

    shape: {
      borderRadius: 18,
    },

    shadows: [
      "none",
      "0 2px 8px rgba(56, 40, 84, 0.04)",
      "0 4px 12px rgba(56, 40, 84, 0.05)",
      "0 6px 18px rgba(56, 40, 84, 0.06)",
      "0 8px 24px rgba(56, 40, 84, 0.07)",
      "0 10px 30px rgba(56, 40, 84, 0.08)",
      ...Array(19).fill("0 12px 36px rgba(56, 40, 84, 0.09)"),
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background:
              "radial-gradient(circle at 15% 10%, rgba(192,82,169,0.10), transparent 28%), radial-gradient(circle at 85% 12%, rgba(101,191,210,0.12), transparent 30%), radial-gradient(circle at 50% 100%, rgba(85,201,181,0.08), transparent 35%), #F6F4FA",

            color: "#241D38",
          },

          "::selection": {
            backgroundColor: "rgba(101, 70, 163, 0.18)",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(101,70,163,0.08)",
            boxShadow: "0 12px 35px rgba(50,35,80,0.08)",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(249,247,253,0.92))",

            border: "1px solid rgba(101,70,163,0.09)",
            boxShadow: "0 12px 32px rgba(58,42,83,0.07)",

            transition:
              "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 18px 42px rgba(73,50,105,0.13)",
              borderColor: "rgba(101,70,163,0.18)",
            },

            "&::before": {
              content: '""',
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: "50%",
              top: -70,
              right: -70,
              background:
                "radial-gradient(circle, rgba(101,191,210,0.13), transparent 70%)",
              pointerEvents: "none",
            },
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 22,
            paddingBlock: 10,
            minHeight: 44,
            fontWeight: 700,

            transition:
              "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",

            "&:hover": {
              transform: "translateY(-1px)",
            },
          },

          containedPrimary: {
            background:
              "linear-gradient(135deg, #6546A3 0%, #8758B0 55%, #C052A9 100%)",

            boxShadow: "0 8px 20px rgba(101,70,163,0.20)",

            "&:hover": {
              background:
                "linear-gradient(135deg, #593D92 0%, #7A4EA2 55%, #AE489A 100%)",

              boxShadow: "0 11px 25px rgba(101,70,163,0.27)",
            },
          },

          containedSecondary: {
            background: "linear-gradient(135deg, #55C9B5 0%, #65BFD2 100%)",

            color: "#173A40",

            "&:hover": {
              background: "linear-gradient(135deg, #49BAA7 0%, #58B1C4 100%)",
            },
          },

          outlined: {
            borderColor: "rgba(101,70,163,0.28)",

            "&:hover": {
              borderColor: "#6546A3",
              backgroundColor: "rgba(101,70,163,0.05)",
            },
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              "linear-gradient(90deg, rgba(56,40,84,0.97), rgba(91,57,124,0.96))",

            boxShadow: "0 6px 24px rgba(46,32,67,0.14)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 650,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: "rgba(255,255,255,0.74)",
            borderRadius: 14,

            "& fieldset": {
              borderColor: "rgba(101,70,163,0.16)",
            },

            "&:hover fieldset": {
              borderColor: "rgba(101,70,163,0.35)",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#6546A3",
              borderWidth: 1.5,
            },
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#2D2441",
            fontSize: "0.82rem",
            borderRadius: 8,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "rgba(101,70,163,0.10)",
          },
        },
      },
    },
  });
