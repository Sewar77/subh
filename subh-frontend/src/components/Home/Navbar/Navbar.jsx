import { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import {
  Box,
  Button,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Tooltip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import TranslateIcon from "@mui/icons-material/Translate";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";
import { authContext } from "../../../Context/authContextValue.js";
import { useLanguage } from "../../../Context/LanguageContext";

export default function Navbar() {
  const { language, setLanguage } = useLanguage();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const { logout } = useAuth();
  const { user } = useContext(authContext);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const pages = [
    {
      name: {
        en: "Home",
        ar: "الرئيسية",
      },
      path: "/",
    },
    {
      name: {
        en: "Training Courses",
        ar: "الدورات التدريبية",
      },
      path: "/courses",
    },
    {
      name: {
        en: "Books",
        ar: "الكتب",
      },
      path: "/subh/books",
    },
    {
      name: {
        en: "Workshops",
        ar: "ورش العمل",
      },
      path: "/workshops",
    },
    {
      name: {
        en: "Who We Are",
        ar: "من نحن",
      },
      path: "/about",
    },
    {
      name: {
        en: "Contact Us",
        ar: "اتصل بنا",
      },
      path: "/contact",
    },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        direction: language === "ar" ? "rtl" : "ltr",
        mb: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
        width: "100%",
        mx: "auto",
        p: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
        borderRadius: 5,
        background: "linear-gradient(90deg, #bb40bf, #613389, #102943)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <Tooltip title={language === "en" ? "Home Page" : "الصفحة الرئيسية"}>
          <IconButton onClick={() => navigate("/")}>
            <Box
              component="img"
              src="/subhlogo.png"
              sx={{
                width: "50px",
              }}
            />
          </IconButton>
        </Tooltip>

        {/* DESKTOP MENU */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 3,
          }}
        >
          {pages.map((page) => (
            <Typography
              key={page.path}
              onClick={() => navigate(page.path)}
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": {
                  color: "success.main",
                },
              }}
            >
              {page.name[language]}
            </Typography>
          ))}
        </Box>

        {/* ACTIONS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* LANGUAGE */}
          <Tooltip
            title={language === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            <IconButton
              onClick={toggleLanguage}
              sx={{
                bgcolor: "secondary.main",
                color: "text.secondary",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {language === "en" ? "عربي" : "English"}
              </Typography>

              <TranslateIcon />
            </IconButton>
          </Tooltip>

          {/* USER */}
          {user ? (
            <>
              <Tooltip title={language === "en" ? "Profile" : "الملف الشخصي"}>
                <IconButton>
                  <PersonOutlinedIcon
                    sx={{
                      color: "text.secondary",
                    }}
                  />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(45deg, rgb(0,255,255), rgb(255,0,255))",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: "none",
                  display: { xs: "none", sm: "flex" },
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, rgb(255,0,255), #613389)",
                  },
                }}
                onClick={logout}
              >
                {language === "en" ? "Logout" : "تسجيل الخروج"}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              sx={{
                background:
                  "linear-gradient(45deg, rgb(0,255,255), rgb(255,0,255))",
                color: "#fff",
                fontWeight: 600,
                borderRadius: 3,
                textTransform: "none",
                display: { xs: "none", sm: "flex" },
                "&:hover": {
                  background: "linear-gradient(90deg, rgb(255,0,255), #613389)",
                },
              }}
              onClick={() => navigate("/login")}
            >
              {language === "en" ? "Login" : "تسجيل الدخول"}
            </Button>
          )}

          {/* MOBILE MENU */}
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              display: { xs: "flex", md: "none" },
              color: "white",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor={language === "ar" ? "left" : "right"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box
          sx={{
            width: 250,
            p: 2,
            minHeight: "100vh",
            direction: language === "ar" ? "rtl" : "ltr",
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            {language === "en" ? "Menu" : "القائمة"}
          </Typography>

          <List>
            {pages.map((page) => (
              <ListItem key={page.path} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(page.path);
                    setOpen(false);
                  }}
                >
                  {page.name[language]}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
