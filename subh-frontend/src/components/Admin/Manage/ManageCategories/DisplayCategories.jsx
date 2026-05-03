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
import AddCategoriesBtn from "./AddCategoriesBtn";
import { useEffect } from "react";

export default function DisplayCategories() {
  const { categories, loadCategories } = useCategories();
  const theme = useTheme();
  useEffect(() => {
    loadCategories();
  }, []);
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
        <AddCategoriesBtn />
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
            }}
          >
            <TableRow>
              <TableCell sx={{ width: 360 }}>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell sx={{ width: 160, textAlign: "center" }}>
                Created
              </TableCell>
              <TableCell sx={{ width: 160, textAlign: "center" }}>
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
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
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
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: { xs: 180, sm: 260 },
                        }}
                        title={`${category.name_en} || ${category.name_ar}`}
                      >
                        {category.name_en} {" || "} {category.name_ar}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display: "inline-block",
                          color: "text.primary",
                          mt: 0.5,
                        }}
                      >
                        ID: {category.id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Box
                    sx={{
                      color: "text.primary",
                      fontSize: 14,
                      lineHeight: 1.4,
                      maxWidth: { xs: 220, sm: 520 },
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      textOverflow: "ellipsis",
                    }}
                    title={`${category.description_en || ""}\n${category.description_ar || ""}`}
                  >
                    <Typography component="div" sx={{ color: "text.primary" }}>
                      {category.description_en || "—"}
                    </Typography>
                    <Typography
                      component="div"
                      sx={{
                        color: "text.primary",
                        direction: "rtl",
                        mt: 0.5,
                      }}
                    >
                      {category.description_ar || "—"}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: "text.primary" }}>
                    {new Date(category.created_at).toLocaleDateString()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" sx={{ color: "text.primary" }}>
                    {new Date(category.created_at).toLocaleTimeString()}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton size="small" color="error">
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        display: { xs: "none", sm: "inline-flex" },
                      }}
                    >
                      View
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
