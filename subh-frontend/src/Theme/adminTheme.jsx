import { createTheme } from "@mui/material/styles";

export const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#102943", contrastText: "#ffffff" },
    secondary: { main: "#07b9c8", contrastText: "#06283d" },
    background: { default: "#eef5f7", paper: "#ffffff" },
    text: { primary: "#102943", secondary: "#52687a" },
    error: { main: "#c6285b" },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
    fontSize: 16,
    h4: { fontSize: "clamp(1.65rem, 3vw, 2.15rem)", fontWeight: 750 },
    h5: { fontSize: "clamp(1.3rem, 2vw, 1.65rem)", fontWeight: 700 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.94rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 700, fontSize: "0.95rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: "#eef5f7" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTableHead: { styleOverrides: { root: { background: "linear-gradient(100deg, #102943, #086f85)" } } },
    MuiTableCell: { styleOverrides: { head: { color: "#ffffff", fontWeight: 800, fontSize: "0.98rem", letterSpacing: "0.01em", paddingTop: 14, paddingBottom: 14 }, body: { fontSize: "0.96rem", paddingTop: 13, paddingBottom: 13 }, root: { borderColor: "rgba(16,41,67,0.12)" } } },
    MuiTableRow: { styleOverrides: { root: { "&:hover": { backgroundColor: "rgba(7,185,200,0.08)" }, "&:focus-within": { backgroundColor: "rgba(155,76,184,0.08)" } } } },
    MuiIconButton: { styleOverrides: { root: { "&:focus-visible": { outline: "3px solid #07b9c8", outlineOffset: 2 } } } },
    MuiOutlinedInput: { styleOverrides: { root: { "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#07b9c8", borderWidth: 2 } } } },
  },
});
