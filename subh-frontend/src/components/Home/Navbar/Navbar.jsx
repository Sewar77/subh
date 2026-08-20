import { useContext, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../../Hooks/useAuth";
import { authContext } from "../../../Context/authContextValue.js";
import { useLanguage } from "../../../Context/LanguageContext";

const pages = [
  { name: { en: "Home", ar: "الرئيسية" }, path: "/" },
  { name: { en: "Books", ar: "الكتب" }, path: "/books" },
  { name: { en: "Categories", ar: "التصنيفات" }, path: "/categories" },
  { name: { en: "Workshops", ar: "ورش العمل" }, path: "/workshops" },
  {
    name: {
      en: "Training Courses",
      ar: "الدورات التدريبية",
    },
    path: "/educational/courses",
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
      en: "Contact",
      ar: "اتصل بنا",
    },
    path: "/contact",
  },
];

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const { user } = useContext(authContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isArabic = language === "ar";

  const navigateTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          direction: isArabic ? "rtl" : "ltr",

          background:
            "linear-gradient(135deg, rgba(36,29,56,0.96) 0%, rgba(50,37,76,0.96) 55%, rgba(43,37,69,0.96) 100%)",

          backdropFilter: "blur(22px)",

          borderBottom: "1px solid rgba(255,255,255,0.08)",

          boxShadow: "0 8px 32px rgba(40, 27, 61, 0.12)",

          overflow: "hidden",

          "&::before": {
            content: '""',
            position: "absolute",
            width: 280,
            height: 280,
            left: "5%",
            top: -220,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(192,82,169,0.35), transparent 70%)",
            pointerEvents: "none",
          },

          "&::after": {
            content: '""',
            position: "absolute",
            width: 320,
            height: 320,
            right: "8%",
            top: -250,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(101,191,210,0.30), transparent 70%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 70,
                md: 78,
              },

              gap: {
                xs: 1,
                md: 2,
              },

              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Logo */}
            <Tooltip title={isArabic ? "الرئيسية" : "Home"}>
              <IconButton
                onClick={() => navigateTo("/")}
                aria-label={isArabic ? "الرئيسية" : "Home"}
                sx={{
                  p: 0.5,
                  mr: isArabic ? 0 : 1,
                  ml: isArabic ? 1 : 0,

                  transition: "transform 180ms ease",

                  "&:hover": {
                    transform: "scale(1.05)",
                    bgcolor: "transparent",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/subhlogo.png"
                  alt="Subh"
                  sx={{
                    width: {
                      xs: 44,
                      md: 52,
                    },
                    height: {
                      xs: 44,
                      md: 52,
                    },
                    objectFit: "contain",
                  }}
                />
              </IconButton>
            </Tooltip>

            {/* Brand */}
            <Box
              onClick={() => navigateTo("/")}
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
                cursor: "pointer",
                mr: isArabic ? 0 : 2,
                ml: isArabic ? 2 : 0,
              }}
            >
              <Typography
                sx={{
                  color: "common.white",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  lineHeight: 1,
                  letterSpacing: isArabic ? 0 : "-0.03em",
                }}
              >
                {isArabic ? "صُبح" : "SUBH"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  color: "rgba(255,255,255,0.58)",
                  fontSize: "0.68rem",
                  letterSpacing: isArabic ? 0 : "0.08em",
                }}
              >
                {isArabic ? "معرفة تلهم" : "KNOWLEDGE INSPIRES"}
              </Typography>
            </Box>

            {/* Desktop navigation */}
            <Box
              sx={{
                display: {
                  xs: "none",
                  lg: "flex",
                },

                alignItems: "center",
                gap: 0.4,
                flex: 1,
              }}
            >
              {pages.map((page) => {
                const active = isActive(page.path);

                return (
                  <Button
                    key={page.path}
                    onClick={() => navigateTo(page.path)}
                    sx={{
                      position: "relative",

                      px: 1.6,
                      py: 1,

                      borderRadius: 2.5,

                      color: active ? "common.white" : "rgba(255,255,255,0.72)",

                      fontWeight: active ? 700 : 600,

                      bgcolor: active
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",

                      transition:
                        "background-color 180ms ease, color 180ms ease",

                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.07)",
                        color: "common.white",
                      },

                      "&::after": active
                        ? {
                            content: '""',
                            position: "absolute",
                            height: 3,
                            borderRadius: 999,
                            left: "25%",
                            right: "25%",
                            bottom: 2,

                            background:
                              "linear-gradient(90deg, #55C9B5, #65BFD2, #C052A9)",
                          }
                        : {},
                    }}
                  >
                    {page.name[language]}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ flex: { xs: 1, lg: 0 } }} />

            {/* Actions */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",

                gap: {
                  xs: 0.6,
                  sm: 1,
                },
              }}
            >
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<DashboardOutlinedIcon />}
                  onClick={() => navigateTo("/admin")}
                  sx={{
                    display: {
                      xs: "none",
                      md: "inline-flex",
                    },

                    px: 2,

                    background: "linear-gradient(135deg, #55C9B5, #65BFD2)",

                    color: "#173A40",

                    "&:hover": {
                      background: "linear-gradient(135deg, #49BAA7, #58B1C4)",
                    },
                  }}
                >
                  {isArabic ? "لوحة التحكم" : "Dashboard"}
                </Button>
              )}

              {user?.role === "user" && (
                <Button
                  variant="outlined"
                  startIcon={<ReceiptLongOutlinedIcon />}
                  onClick={() => navigateTo("/my-requests")}
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    minHeight: 44,
                    color: "common.white",
                    borderColor: "rgba(255,255,255,.32)",
                  }}
                >
                  {isArabic ? "طلباتي" : "My Requests"}
                </Button>
              )}

              {/* Language */}
              <Tooltip
                title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
              >
                <IconButton
                  onClick={() => setLanguage(isArabic ? "en" : "ar")}
                  aria-label={
                    isArabic ? "Switch to English" : "Switch to Arabic"
                  }
                  sx={{
                    width: 44,
                    height: 44,

                    border: "1px solid rgba(255,255,255,0.13)",

                    bgcolor: "rgba(255,255,255,0.06)",

                    color: "common.white",

                    transition:
                      "background-color 180ms ease, transform 180ms ease",

                    "&:hover": {
                      bgcolor: "rgba(101,191,210,0.18)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <TranslateRoundedIcon />
                </IconButton>
              </Tooltip>

              {/* Login/logout */}
              {user ? (
                <Button
                  variant="outlined"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={logout}
                  sx={{
                    display: {
                      xs: "none",
                      md: "inline-flex",
                    },

                    minHeight: 44,

                    color: "common.white",

                    borderColor: "rgba(255,255,255,0.18)",

                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.40)",
                      bgcolor: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  {isArabic ? "تسجيل الخروج" : "Logout"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<LoginRoundedIcon />}
                  onClick={() => navigateTo("/login")}
                  sx={{
                    display: {
                      xs: "none",
                      sm: "inline-flex",
                    },

                    background: "linear-gradient(135deg, #6546A3, #C052A9)",

                    "&:hover": {
                      background: "linear-gradient(135deg, #593D92, #AE489A)",
                    },
                  }}
                >
                  {isArabic ? "تسجيل الدخول" : "Login"}
                </Button>
              )}

              {/* Mobile menu */}
              <IconButton
                aria-label={isArabic ? "فتح القائمة" : "Open navigation menu"}
                onClick={() => setOpen(true)}
                sx={{
                  display: {
                    xs: "inline-flex",
                    lg: "none",
                  },

                  width: 44,
                  height: 44,

                  color: "common.white",

                  border: "1px solid rgba(255,255,255,0.13)",

                  bgcolor: "rgba(255,255,255,0.06)",

                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.10)",
                  },
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor={isArabic ? "left" : "right"}
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: {
              xs: "88vw",
              sm: 360,
            },

            maxWidth: 380,

            color: "text.primary",

            background: "linear-gradient(180deg, #FAF8FC 0%, #F4F1F9 100%)",

            borderLeft: isArabic ? "none" : "1px solid rgba(101,70,163,0.10)",

            borderRight: isArabic ? "1px solid rgba(101,70,163,0.10)" : "none",
          },
        }}
      >
        <Box
          sx={{
            p: 2.5,
            direction: isArabic ? "rtl" : "ltr",
          }}
        >
          {/* Drawer header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
              }}
            >
              <Box
                component="img"
                src="/subhlogo.png"
                alt="Subh"
                sx={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                }}
              />

              <Box>
                <Typography fontWeight={800}>
                  {isArabic ? "صُبح" : "SUBH"}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {isArabic ? "قائمة التنقل" : "Navigation"}
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={() => setOpen(false)}
              aria-label={isArabic ? "إغلاق" : "Close menu"}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List disablePadding>
            {pages.map((page) => {
              const active = isActive(page.path);

              return (
                <ListItem key={page.path} disablePadding sx={{ mb: 0.7 }}>
                  <ListItemButton
                    onClick={() => navigateTo(page.path)}
                    sx={{
                      borderRadius: 3,
                      px: 2,
                      py: 1.35,

                      bgcolor: active ? "rgba(101,70,163,0.10)" : "transparent",

                      border: active
                        ? "1px solid rgba(101,70,163,0.14)"
                        : "1px solid transparent",

                      "&:hover": {
                        bgcolor: "rgba(101,70,163,0.07)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={page.name[language]}
                      primaryTypographyProps={{
                        fontWeight: active ? 750 : 600,

                        color: active ? "primary.main" : "text.primary",
                      }}
                    />

                    <ArrowForwardRoundedIcon
                      fontSize="small"
                      sx={{
                        opacity: 0.45,

                        transform: isArabic ? "rotate(180deg)" : "none",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 2.5 }} />

          {isAdmin && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<DashboardOutlinedIcon />}
              onClick={() => navigateTo("/admin")}
              sx={{
                mb: 1.2,

                background: "linear-gradient(135deg, #55C9B5, #65BFD2)",

                color: "#173A40",
              }}
            >
              {isArabic ? "لوحة التحكم" : "Dashboard"}
            </Button>
          )}

          {user?.role === "user" && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ReceiptLongOutlinedIcon />}
              onClick={() => navigateTo("/my-requests")}
              sx={{ mb: 1.2 }}
            >
              {isArabic ? "طلباتي" : "My Requests"}
            </Button>
          )}

          {user ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutRoundedIcon />}
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              {isArabic ? "تسجيل الخروج" : "Logout"}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<LoginRoundedIcon />}
              onClick={() => navigateTo("/login")}
            >
              {isArabic ? "تسجيل الدخول" : "Login"}
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
}
