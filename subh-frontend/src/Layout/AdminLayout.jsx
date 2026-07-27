import { useCallback, useEffect, useState } from "react";
import { Box, CssBaseline, Drawer, ThemeProvider } from "@mui/material";
import { Outlet } from "react-router-dom";
import { adminTheme } from "../Theme/adminTheme.jsx";
import AdminBackButton from "../components/Admin/AdminBackButton.jsx";
import AdminNavbar from "../components/Admin/Layout/AdminNavbar.jsx";
import AdminSidebar from "../components/Admin/Layout/AdminSidebar.jsx";

const SIDEBAR_PREFERENCE_KEY = "subh.admin.sidebarCollapsed";

const getInitialCollapsedState = () => {
  try {
    return window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === "true";
  } catch {
    return false;
  }
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsedState);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(collapsed));
    } catch {
      // A blocked storage provider should not prevent the admin shell from rendering.
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(
    () => setCollapsed((value) => !value),
    [],
  );
  const openMobileNavigation = useCallback(() => setMobileOpen(true), []);
  const closeMobileNavigation = useCallback(() => setMobileOpen(false), []);

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AdminNavbar
          collapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
          onOpenMobileNavigation={openMobileNavigation}
        />
        <Box sx={{ display: "flex", minWidth: 0 }}>
          <Box
            component="aside"
            aria-label="Administrator navigation"
            sx={{
              display: { xs: "none", md: "block" },
              flex: `0 0 ${collapsed ? 80 : 288}px`,
              width: collapsed ? 80 : 288,
              position: "sticky",
              top: 72,
              alignSelf: "flex-start",
              height: "calc(100vh - 72px)",
              transition: "width 180ms ease, flex-basis 180ms ease",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <AdminSidebar collapsed={collapsed} />
          </Box>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={closeMobileNavigation}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: 288, maxWidth: "85vw" } }}
          >
            <Box component="aside" aria-label="Administrator navigation">
              <AdminSidebar onNavigate={closeMobileNavigation} />
            </Box>
          </Drawer>
          <Box
            component="main"
            sx={{
              minWidth: 0,
              flex: 1,
              overflowX: "hidden",
              pb: { xs: 3, md: 5 },
            }}
          >
            <AdminBackButton />
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
