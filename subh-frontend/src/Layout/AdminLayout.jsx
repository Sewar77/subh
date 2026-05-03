import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { adminTheme } from "../theme/adminTheme.jsx";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/Layout/AdminSidebar";
import AdminNavbar from "../components/Admin/Layout/AdminNavbar";

export default function AdminLayout() {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <AdminNavbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          minWidth: "100%",
        }}
      >
        <Box
          sx={{
            top: 0,
            left: 0,
          }}
        >
          <AdminSidebar />
        </Box>
        <Box
          sx={{
            width: "100%",
          }}
        >
          <Outlet
            sx={{ maxHeight: "95vh", overflowY: "auto", overflowX: "hidden" }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
