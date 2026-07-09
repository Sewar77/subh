import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import TranslateIcon from "@mui/icons-material/Translate";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import Title from "../../Headers/Titles";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";

export default function ViewAllSections() {
  const { allSections, loading, getAllSections, deleteSection } = usePages();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    getAllSections();
  }, [getAllSections]);

  const filteredSections = useMemo(() => {
    return (allSections || []).filter((section) => {
      const value = `
        ${section.id}
        ${section.page_key}
        ${section.type}
        ${section.page_status}
      `.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [allSections, search]);

  const handleDelete = async () => {
    if (!selectedSection) return;

    await deleteSection(selectedSection.id);

    setDeleteModal(false);
    setSelectedSection(null);

    getAllSections();
  };

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Title
        title="All Sections"
        caption="Manage all sections across all pages."
      />

      <TextField
        fullWidth
        label="Search sections"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiInputBase-input": {
            fontSize: "1.05rem",
          },
          "& .MuiInputLabel-root": {
            fontSize: "1rem",
          },
        }}
      />

      {loading && (
        <LinearProgress
          sx={{
            mb: 2,
          }}
        />
      )}

      {filteredSections.length === 0 ? (
        <Typography
          sx={{
            mt: 4,
            textAlign: "center",
            fontSize: "1.2rem",
            fontWeight: 600,
          }}
        >
          No sections found.
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
              minWidth: 950,
              "& .MuiTableCell-root": {
                py: 2,
                px: 2,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    ID
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Page
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Type
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Position
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Status
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Translations
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Media
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredSections.map((section) => (
                <TableRow key={section.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>
                      #{section.id}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>
                      {section.page_key}
                    </Typography>

                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.85rem",
                      }}
                    >
                      Page ID: {section.page_id}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={section.type}
                      sx={{
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {section.position}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={section.is_visible ? "Visible" : "Hidden"}
                      color={section.is_visible ? "success" : "default"}
                      sx={{
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {section.translations?.length || 0}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {section.media?.length || 0}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Tooltip title="View Section">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/view-section/${section.id}`)
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Translations">
                        <IconButton
                          onClick={() =>
                            navigate(
                              `/admin/add-translations-section/${section.id}`,
                            )
                          }
                        >
                          <TranslateIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Section">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedSection(section);
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
            setSelectedSection(null);
          }}
          onConfirm={handleDelete}
          label="Section"
        />
      )}
    </Box>
  );
}
