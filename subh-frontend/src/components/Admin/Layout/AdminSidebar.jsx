import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
export default function AdminSidebar() {
  const sections = [
    {
      title: "Categories",
      items: [
        { label: "View Categories", path: "/admin/categories" },
        { label: "Add Category", path: "/admin/new-category" },
      ],
    },
    {
      title: "Users",
      items: [
        { label: "Users", path: "/admin/users" },
        { label: "Add User", path: "/admin/add/user" },
      ],
    },
    {
      title: "Pages",
      items: [{ label: "Structured CMS", path: "/admin/cms" }],
    },
    {
      title: "Text Books",
      items: [
        { label: "View Books", path: "/admin/books" },
        { label: "Add Book", path: "/admin/book/new" },
        { label: "Books Requests", path: "/admin/book/new" },
      ],
    },
    {
      title: "Work Shops",
      items: [
        { label: "View WorkShops", path: "/admin/workshops" },
        { label: "Add Workshops", path: "" },
        { label: "Manage Appoientments", path: "" },
      ],
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "primary.contrastText",
        color: "text.primary",
        p: 2,
        display: { xs: "none", md: "block" },
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      {sections.map((section, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              px: 1,
              py: 0.5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 1,
              textAlign: "center",
              fontSize: 25,
            }}
          >
            {section.title}
          </Typography>
          <List disablePadding>
            {section.items.map((item, i) => (
              <ListItemButton
                key={i}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    fontSize: 18,
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          {index !== sections.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );
}
