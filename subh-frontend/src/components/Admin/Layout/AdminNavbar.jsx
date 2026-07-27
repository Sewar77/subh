import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../../Hooks/useAuth";
import { useContext, useEffect } from "react";
import { usersContext } from "../../../Context/usersContextValue.js";
import LogoutIcon from "@mui/icons-material/Logout";
export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const { loadUsers } = useContext(usersContext);
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleLogout = () => {
    logout();
  };
  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        bgcolor: "primary.main",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Hi, {user?.name}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "primary.contrastText",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            width: "300px",
          }}
        >
          <SearchIcon sx={{ mr: 1, color: "text.primary" }} />
          <InputBase
            placeholder="Search..."
            sx={{ color: "text.primary", width: "100%" }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <IconButton color="inherit">
            <Tooltip title="Notifications" arrow describeChild>
              <NotificationsIcon />
            </Tooltip>
          </IconButton>
          <IconButton color="inherit">
            <Tooltip title="Account" arrow describeChild>
              <AccountCircle />
            </Tooltip>
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <Tooltip title="Logout" arrow describeChild>
              <LogoutIcon />
            </Tooltip>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
