import { useContext, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import TranslateIcon from "@mui/icons-material/Translate";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";
import { authContext } from "../../../Context/authContextValue.js";
import { useLanguage } from "../../../Context/LanguageContext";

const pages = [
  { name: { en: "Home", ar: "الرئيسية" }, path: "/" },
  { name: { en: "Books", ar: "الكتب" }, path: "/books" },
  { name: { en: "Categories", ar: "التصنيفات" }, path: "/categories" },
  {
    name: { en: "Training courses", ar: "الدورات التدريبية" },
    path: "/educational/courses",
  },
  { name: { en: "Who we are", ar: "من نحن" }, path: "/about" },
  { name: { en: "Contact", ar: "اتصل بنا" }, path: "/contact" },
];

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const { user } = useContext(authContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const isArabic = language === "ar";

  const navigateTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(7, 26, 53, .96)",
        borderBottom: "1px solid rgba(98, 216, 223, .2)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 68, md: 78 },
            gap: 2,
            direction: isArabic ? "rtl" : "ltr",
          }}
        >
          <Tooltip title={isArabic ? "الصفحة الرئيسية" : "Home"}>
            <IconButton
              aria-label={isArabic ? "الصفحة الرئيسية" : "Home"}
              onClick={() => navigateTo("/")}
              sx={{ p: 0 }}
            >
              <Box
                component="img"
                src="/subhlogo.png"
                alt="Subh"
                sx={{
                  width: { xs: 42, md: 50 },
                  height: { xs: 42, md: 50 },
                  objectFit: "contain",
                }}
              />
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              gap: 0.5,
              flex: 1,
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.path}
                color="inherit"
                onClick={() => navigateTo(page.path)}
                sx={{
                  color: "rgba(255,255,255,.86)",
                  "&:hover": {
                    color: "secondary.main",
                    bgcolor: "rgba(255,255,255,.07)",
                  },
                }}
              >
                {page.name[language]}
              </Button>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            {isAdmin && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DashboardOutlinedIcon />}
                onClick={() => navigateTo("/admin")}
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                Dashboard
              </Button>
            )}
            <Tooltip
              title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            >
              <IconButton
                aria-label={isArabic ? "Switch to English" : "Switch to Arabic"}
                onClick={() => setLanguage(isArabic ? "en" : "ar")}
                sx={{ color: "secondary.main" }}
              >
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            {user ? (
              <Button
                variant="outlined"
                color="inherit"
                onClick={logout}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  borderColor: "rgba(255,255,255,.55)",
                  color: "common.white",
                }}
              >
                {isArabic ? "تسجيل الخروج" : "Logout"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigateTo("/login")}
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                {isArabic ? "تسجيل الدخول" : "Login"}
              </Button>
            )}
            <IconButton
              aria-label={isArabic ? "فتح القائمة" : "Open navigation menu"}
              onClick={() => setOpen(true)}
              sx={{
                display: { xs: "inline-flex", lg: "none" },
                color: "common.white",
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      <Drawer
        anchor={isArabic ? "left" : "right"}
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 300, bgcolor: "background.default" } }}
      >
        <Box sx={{ p: 2, direction: isArabic ? "rtl" : "ltr" }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {isArabic ? "التنقل" : "Navigation"}
          </Typography>
          <List>
            {pages.map((page) => (
              <ListItem key={page.path} disablePadding>
                <ListItemButton onClick={() => navigateTo(page.path)}>
                  {page.name[language]}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {isAdmin && (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<DashboardOutlinedIcon />}
              onClick={() => navigateTo("/admin")}
              sx={{ mt: 2 }}
            >
              Dashboard
            </Button>
          )}
          {user ? (
            <Button
              fullWidth
              variant="outlined"
              onClick={logout}
              sx={{ mt: 1 }}
            >
              Logout
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => navigateTo("/login")}
              sx={{ mt: 1 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
