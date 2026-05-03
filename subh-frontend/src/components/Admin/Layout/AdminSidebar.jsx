import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
/*
{
          label: "Workshop Appointments",
          path: "/admin/workshop-appointments",
        },
        { label: "Workshops", path: "/admin/workshops" },
        { label: "Contact Us", path: "/admin/contact" },
*/
export default function AdminSidebar() {
  const sections = [
    {
      title: "Text Books",
      items: [
        { label: "View Books", path: "/admin/courses" },
        { label: "Add Book", path: "/admin/news" },
        { label: "Edit Book", path: "/admin/settings" },
      ],
    },
    {
      title: "Categories",
      items: [
        { label: "View Categories", path: "/admin/categories" },
        { label: "Add Category", path: "" },
        { label: "Edit Category", path: "" },
      ],
    },
    {
      title: "Work Shops",
      items: [
        { label: "View Categories", path: "" },
        { label: "Add Category", path: "" },
        { label: "Edit Category", path: "" },
      ],
    },
    {
      title: "News",
      items: [
        { label: "View Categories", path: "" },
        { label: "Add Category", path: "" },
        { label: "Edit Category", path: "" },
      ],
    },
    {
      title: "Contact Us",
      items: [
        { label: "View Categories", path: "" },
        { label: "Add Category", path: "" },
        { label: "Edit Category", path: "" },
      ],
    },
    {
      title: "About Us",
      items: [
        { label: "View Categories", path: "" },
        { label: "Add Category", path: "" },
        { label: "Edit Category", path: "" },
      ],
    },
    {
      title: "Users",
      items: [
        { label: "Users", path: "/admin/users" },
        { label: "Add User", path: "/admin/add/user" },
        { label: "Delete Users", path: "/admin/users/delete" },
      ],
    },
    {
      title: "Reports",
      items: [
        { label: "View Categories", path: "" },
        { label: "Add Category", path: "" },
        { label: "Edit Category", path: "" },
      ],
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.paper",
        width: { md: "250px", lg: "300px" },
        color: "text.primary",
        p: 2,
        display: { xs: "none", md: "block" },
        borderRight: "1px solid",
        borderColor: "divider",
        position: "static",
        overflow: "auto",
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
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          {index !== sections.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );
}
