import { useState } from "react";
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
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import TranslateIcon from "@mui/icons-material/Translate";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const pages = [
    {
      name: "Home",
      path: "/",
    },
    { name: "Educational Resources", path: "/educational/courses" },
    { name: "Who We Are", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      sx={{
        mb: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
        width: "100%",
        // maxWidth: "1400px",
        mx: "auto",
        p: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
        borderRadius: 5,
        background: "linear-gradient(90deg, #bb40bf, #613389, #102943 )",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <IconButton>
          <Box component="img" src="/subhlogo.png" width="50rem" />
        </IconButton>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 3,
          }}
        >
          {pages.map((page) => (
            <Typography
              key={page.name}
              onClick={() => navigate(page.path)}
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": { color: "success.main" },
              }}
            >
              {page.name}
            </Typography>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <IconButton sx={{ bgcolor: "secondary.main" }}>
            <TranslateIcon sx={{ color: "text.secondary" }} />
          </IconButton>

          <IconButton>
            <PersonOutlinedIcon sx={{ color: "text.secondary" }} />
          </IconButton>

          <Button
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, rgb(0, 255, 255), rgb(255, 0, 255))`,
              color: "#fff",
              fontWeight: 600,
              borderRadius: 3,
              textTransform: "none",
              display: { xs: "none", sm: "flex" },
              "&:hover": {
                background: `linear-gradient(90deg,  rgb(255, 0, 255),#613389)`,
              },
            }}
            onClick={() => navigate("/register")}
          >
            Join Us
          </Button>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{ display: { xs: "flex", md: "none" }, color: "white" }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 250,
            p: 2,
            bgcolor: `linear-gradient(
        90deg,
        #bb40bf ,
        #102943, 
        #613389
      )`,
            minHeight: "100vh",
            color: "text.secondary",
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 700 }}>Menu</Typography>

          <List>
            {pages.map((page) => (
              <ListItem key={page.name} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(page.path);
                    setOpen(false);
                  }}
                >
                  {page.name}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
