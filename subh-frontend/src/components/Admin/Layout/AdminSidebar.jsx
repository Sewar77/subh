import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import { Link, useLocation } from "react-router-dom";

const sections = [
  {
    title: "Overview",
    items: [
      // {
      //   label: "Dashboard",
      //   path: "/admin",
      //   icon: DashboardOutlinedIcon,
      //   exact: true,
      // },
      {
        label: "Analytics",
        path: "/admin/analytics",
        icon: AnalyticsOutlinedIcon,
      },
      {
        label: "Profile",
        path: "/admin/profile",
        icon: AccountCircleOutlinedIcon,
      },
    ],
  },
  {
    title: "Categories",
    items: [
      {
        label: "View categories",
        path: "/admin/categories",
        icon: CategoryOutlinedIcon,
        activePrefixes: ["/admin/category/"],
      },
      {
        label: "Add category",
        path: "/admin/new-category",
        icon: AddCircleOutlineIcon,
      },
    ],
  },
  {
    title: "Users",
    items: [
      {
        label: "Users",
        path: "/admin/users",
        icon: PeopleAltOutlinedIcon,
        activePrefixes: ["/admin/user/"],
      },
      {
        label: "Add user",
        path: "/admin/add/user",
        icon: AddCircleOutlineIcon,
      },
    ],
  },
  {
    title: "Requests",
    items: [
      {
        label: "Book requests",
        path: "/admin/requests",
        icon: AssignmentOutlinedIcon,
      },
    ],
  },
  {
    title: "Pages",
    items: [
      {
        label: "Structured CMS",
        path: "/admin/cms",
        icon: ArticleOutlinedIcon,
      },
      {
        label: "Media Library",
        path: "/admin/media",
        icon: PhotoLibraryOutlinedIcon,
      },
    ],
  },
  {
    title: "Books",
    items: [
      {
        label: "View books",
        path: "/admin/books",
        icon: MenuBookOutlinedIcon,
        activePrefixes: ["/admin/book/"],
      },
      {
        label: "Add book",
        path: "/admin/book/new",
        icon: AddCircleOutlineIcon,
      },
    ],
  },
  {
    title: "Workshops",
    items: [
      {
        label: "Workshops",
        path: "/admin/workshops",
        icon: EventNoteOutlinedIcon,
      },
      {
        label: "Categories & presenters",
        path: "/admin/workshop-resources",
        icon: PeopleAltOutlinedIcon,
      },
      {
        label: "Workshop bookings",
        path: "/admin/workshop-bookings",
        icon: AssignmentOutlinedIcon,
      },
    ],
  },
];

export default function AdminSidebar({ collapsed = false, onNavigate }) {
  const location = useLocation();

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`) ||
        item.activePrefixes?.some((prefix) =>
          location.pathname.startsWith(prefix),
        );

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        p: collapsed ? 1 : 2,
        transition: "padding 180ms ease",
      }}
    >
      {sections.map((section, index) => (
        <Box key={section.title} sx={{ mb: 2 }}>
          {!collapsed && (
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                display: "block",
                px: 1.25,
                pb: 0.5,
                fontWeight: 800,
                letterSpacing: ".08em",
              }}
            >
              {section.title}
            </Typography>
          )}
          <List disablePadding aria-label={section.title}>
            {section.items.map((item) => {
              const Icon = item.icon;
              const button = (
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive(item)}
                  aria-label={item.label}
                  onClick={onNavigate}
                  sx={{
                    minHeight: 48,
                    mb: 0.5,
                    px: collapsed ? 1.5 : 1.25,
                    justifyContent: collapsed ? "center" : "initial",
                    borderRadius: 1.5,
                    "&.Mui-selected": {
                      bgcolor: "rgba(7,185,200,.16)",
                      color: "primary.main",
                      "&:hover": { bgcolor: "rgba(7,185,200,.22)" },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 38,
                      color: "inherit",
                      justifyContent: "center",
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive(item) ? 800 : 600,
                      }}
                    />
                  )}
                </ListItemButton>
              );
              return collapsed ? (
                <Tooltip key={item.path} title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                <Box key={item.path}>{button}</Box>
              );
            })}
          </List>
          {index !== sections.length - 1 && <Divider sx={{ mt: 1.5 }} />}
        </Box>
      ))}
    </Box>
  );
}
