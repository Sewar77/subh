import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Stack,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useTheme } from "@mui/material/styles";
import { useCategories } from "../../../../Hooks/useCategories";
import { useEffect, useState } from "react";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import { useNavigate } from "react-router-dom";
import DeleteButton from "../../Buttons/DeleteBtn";
import ViewButton from "../../Buttons/ViewBtn";
import AddButton from "../../Buttons/AddBtn";
import UpdateCategory from "./UpdateCategory";
import UpdateBtn from "../../Buttons/UpdateBtn";

export default function DisplayCategories() {
  const { categories, loadCategories, deleteCategoryById, getCategory } =
    useCategories();
  const theme = useTheme();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedViewId, setSelectedViewId] = useState(null);
  const [selectedUpdateId, setSelectedUpdateId] = useState(null);
  const handleViewCategory = (catId) => {
    navigate(`/admin/view/category/${catId}`);
  };
  const handleUpdateCategory = (catId) => {
    navigate(`/admin/category/update/${catId}`);
  };
  return (
    <Box sx={{ color: "text.primary", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontWeight: 700,
          }}
        >
          Categories
        </Typography>
        <AddButton label={"Category"} to={"/admin/new-category"} />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: "auto",
          bgcolor: "background.default",
        }}
      >
        <Table>
          <TableHead
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 900,
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  width: 100,
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  fontSize: 24,
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  width: 340,
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  fontSize: 24,
                }}
              >
                Name
                <br />
                &
                <br />
                Description
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography sx={{ fontSize: 20 }}>En</Typography>
                  <Typography sx={{ fontSize: 20 }}>Ar</Typography>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  width: 100,
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  fontSize: 25,
                }}
              >
                Created
              </TableCell>
              <TableCell
                sx={{
                  width: 100,
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories?.map((category) => (
              <TableRow
                key={category.id}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                {/* CATEGORY (IMAGE + BASIC INFO) */}
                <TableCell>
                  <Avatar
                    src={category.image}
                    variant="rounded"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      flexShrink: 0,
                    }}
                  />
                </TableCell>
                {/* DESCRIPTION (GROUPED BY LANGUAGE) */}
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      justifyContent: "left",
                    }}
                  >
                    {/* ENGLISH */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 25 }}>
                        {category.name_en || "—"}
                      </Typography>

                      <Typography
                        sx={{ fontSize: 23, color: "text.secondary" }}
                      >
                        {category.description_en || "—"}
                      </Typography>
                    </Box>

                    {/* DIVIDER */}
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ bgcolor: "text.secondary" }}
                    />

                    {/* ARABIC */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 25,
                          direction: "rtl",
                          textAlign: "right",
                        }}
                      >
                        {category.name_ar || "—"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 23,
                          color: "text.secondary",
                          direction: "rtl",
                          textAlign: "right",
                        }}
                      >
                        {category.description_ar || "—"}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                {/* CREATED DATE */}
                <TableCell align="center">
                  <Typography variant="body1">
                    {new Date(category.created_at).toLocaleDateString()}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body1">
                    {new Date(category.created_at).toLocaleTimeString()}
                  </Typography>
                </TableCell>

                {/* ACTIONS */}
                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <UpdateBtn
                      onClick={() => handleUpdateCategory(category.id)}
                    />

                    <DeleteButton
                      onClick={() => {
                        setSelectedViewId(category.id);
                        setConfirmDelete(true);
                      }}
                    />

                    <ViewButton
                      onClick={() => handleViewCategory(category.id)}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {confirmDelete && (
        <ConfirmDeleteModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => (
            deleteCategoryById(selectedViewId),
            setConfirmDelete(false)
          )}
          label={"Category"}
        />
      )}
    </Box>
  );
}
