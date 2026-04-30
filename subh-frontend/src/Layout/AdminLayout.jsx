import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { adminTheme } from "../theme/adminTheme";
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
            width: 250,
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            marginTop: "65px",
          }}
        >
          <AdminSidebar />
        </Box>
        <Box
          sx={{
            marginLeft: { md: "300px" },
            width: "100%",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
