import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";

export default function AdminNavbar({ collapsed, onToggleSidebar, onOpenMobileNavigation }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" elevation={2} sx={{ bgcolor: "primary.main" }}>
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: { xs: 0.5, md: 1.5 }, px: { xs: 1, sm: 2, md: 3 } }}>
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <IconButton aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} color="inherit" onClick={onToggleSidebar} sx={{ display: { xs: "none", md: "inline-flex" } }}>
            <MenuOpenIcon sx={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 180ms ease" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open navigation">
          <IconButton aria-label="Open administrator navigation" color="inherit" onClick={onOpenMobileNavigation} sx={{ display: { xs: "inline-flex", md: "none" } }}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h6" noWrap>Administrator</Typography>
          <Typography variant="body2" noWrap sx={{ color: "rgba(255,255,255,.76)" }}>Signed in as {user?.name || user?.email || "administrator"}</Typography>
        </Box>
        <Tooltip title="Preview site">
          <Button aria-label="Preview public website" color="inherit" startIcon={<VisibilityOutlinedIcon />} onClick={() => navigate("/")} sx={{ display: { xs: "none", sm: "inline-flex" }, border: "1px solid rgba(255,255,255,.5)" }}>Preview site</Button>
        </Tooltip>
        <Tooltip title="Preview site">
          <IconButton aria-label="Preview public website" color="inherit" onClick={() => navigate("/")} sx={{ display: { xs: "inline-flex", sm: "none" } }}><VisibilityOutlinedIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Profile">
          <IconButton aria-label="Open administrator profile" color="inherit" onClick={() => navigate("/admin/profile")}><AccountCircleOutlinedIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <IconButton aria-label="Logout" color="inherit" onClick={logout}><LogoutIcon /></IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
