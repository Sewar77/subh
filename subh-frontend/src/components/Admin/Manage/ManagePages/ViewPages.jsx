import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TranslateIcon from "@mui/icons-material/Translate";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePages } from "../../../../Context/pageContext";
import Title from "../../Headers/Titles";
import AddButton from "../../Buttons/AddBtn";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import { useNavigate } from "react-router-dom";
export default function ViewPages() {
  const { pages, loading, fetchPages, deletePage } = usePages();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  useEffect(() => {
    fetchPages();
  }, []);
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const value = `${page.key} ${page.status}`.toLowerCase();
      return value.includes(search.toLowerCase());
    });
  }, [pages, search]);
  const handleDelete = async () => {
    if (!selectedPage) return;
    await deletePage(selectedPage.id);
    setDeleteModal(false);
    setSelectedPage(null);
    fetchPages();
  };
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
      }}
    >
      <Title
        title="Pages Control Center"
        caption="Manage website pages and their content."
      />
      <TextField
        fullWidth
        label="Search pages"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 4,

          "& .MuiInputBase-input": {
            fontSize: {
              xs: "1rem",
              md: "1.2rem",
            },
          },

          "& .MuiInputLabel-root": {
            fontSize: {
              xs: "1rem",
              md: "1.1rem",
            },
          },
        }}
      />

      {loading && (
        <LinearProgress
          sx={{
            mb: 3,
          }}
        />
      )}

      {filteredPages.length === 0 ? (
        <Typography
          variant="h5"
          textAlign="center"
          sx={{
            mt: 5,
          }}
        >
          No pages found
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            overflowX: "auto",
          }}
        >
          <Table
            sx={{
              minWidth: 900,
              "& .MuiTableCell-root": {
                padding: {
                  xs: "14px 16px",
                  md: "22px 28px",
                },
              },
              "& .MuiTableRow-root": {
                height: {
                  xs: 70,

                  md: 90,
                },
              },
            }}
          >
            <TableHead>
              <TableRow>
                {["Page Key", "Name", "Status", "Created", "Actions"].map(
                  (header) => (
                    <TableCell
                      key={header}
                      align={header === "Actions" ? "center" : "left"}
                    >
                      <Typography
                        fontWeight={800}
                        fontSize={{
                          xs: "1rem",
                          md: "1.25rem",
                        }}
                      >
                        {header}
                      </Typography>
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredPages.map((page) => (
                <TableRow
                  key={page.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {/* KEY */}
                  <TableCell>
                    <Typography
                      fontSize={{
                        xs: "1.3rem",
                        md: "1.7rem",
                      }}
                      fontWeight={900}
                    >
                      {page.key}
                    </Typography>

                    <Typography
                      fontSize="0.95rem"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Unique identifier used by the system to locate this page.
                    </Typography>
                  </TableCell>

                  {/* NAME */}
                  <TableCell>
                    <Typography
                      fontSize={{
                        xs: "1.rem",
                        md: "1.6rem",
                      }}
                      fontWeight={800}
                    >
                      {page.name || "No name"}
                    </Typography>

                    <Typography
                      fontSize="0.95rem"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Display name shown to administrators for managing content.
                    </Typography>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Chip
                      label={page.status}
                      color={
                        page.status === "published" ? "success" : "warning"
                      }
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        height: 36,
                      }}
                    />

                    <Typography
                      fontSize="0.85rem"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Current publishing state.
                    </Typography>
                  </TableCell>

                  {/* CREATED */}
                  <TableCell>
                    <Typography fontSize="1.1rem">
                      {new Date(page.created_at).toLocaleDateString()}
                    </Typography>

                    <Typography fontSize="0.85rem" color="text.secondary">
                      Creation date.
                    </Typography>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="View page content">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/view-page/${page.id}`)
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage translations">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/page-translations/${page.id}`)
                          }
                        >
                          <TranslateIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Manage page sections">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/view-page-sections/${page.id}`)
                          }
                        >
                          <ViewModuleIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete page">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedPage(page);
                            setDeleteModal(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {deleteModal && (
        <ConfirmDeleteModal
          open={deleteModal}
          onClose={() => {
            setDeleteModal(false);

            setSelectedPage(null);
          }}
          onConfirm={handleDelete}
          label="Page"
        />
      )}
    </Box>
  );
}
