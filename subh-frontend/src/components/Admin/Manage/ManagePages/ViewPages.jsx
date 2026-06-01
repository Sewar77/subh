import { useEffect, useState } from "react";
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
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import SettingsIcon from "@mui/icons-material/Settings";
import TranslateIcon from "@mui/icons-material/Translate";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { usePages } from "../../../../Hooks/usePages";
import AddButton from "../../Buttons/AddBtn";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DeleteButton from "../../Buttons/DeleteBtn";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";

export default function ViewPages() {
  const { pages, fetchAllPages, loading, deletePageById } = usePages();
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetchAllPages();
  }, []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const filtered = (pages || []).filter((p) => {
    const key = p.key || "";
    const template = p.template_name || "";
    return (
      key.toLowerCase().includes(search.toLowerCase()) ||
      template.toLowerCase().includes(search.toLowerCase())
    );
  });
  const getCompletionState = (page) => {
    const hasTemplate = !!page.template_id;
    const hasStatus = page.status === "published";
    const hasBaseConfig = !!page.key;
    if (!hasBaseConfig) {
      return {
        label: "Broken",
        color: "error",
        note: "Missing page identifier",
      };
    }
    if (!hasTemplate) {
      return {
        label: "Unassigned",
        color: "warning",
        note: "No template attached",
      };
    }
    if (!hasStatus || page.status === "draft") {
      return { label: "In Progress", color: "warning", note: "Not live yet" };
    }
    return { label: "Ready", color: "success", note: "Fully configured page" };
  };
  // const navigate = useNavigate()
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3">Pages Control Center</Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        These are page configurations. Each one represents a website route that
        will later be filled with content sections and translations.
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <TextField
        fullWidth
        placeholder="Search pages by key or template..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ my: 2 }}
      />
      <Box
        sx={{
          my: 3,
          display: "flex",
          justifyContent: "center",
          gap: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
          To create new page, choose a template first
        </Typography>
        <AddButton
          label="Page"
          to={"/admin/view-template"}
          onClick={() => toast("Select a template to continue")}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Page</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>State</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((page) => {
              const state = getCompletionState(page);
              return (
                <TableRow key={page.id} hover>
                  {/* PAGE KEY */}
                  <TableCell>
                    <Typography fontWeight={600}>{page.key}</Typography>
                  </TableCell>
                  {/* TEMPLATE */}
                  <TableCell>
                    <Chip
                      label={page.template_name || "No template"}
                      size="small"
                    />
                  </TableCell>
                  {/* STATUS */}
                  <TableCell>
                    <Chip
                      label={page.status}
                      color={
                        page.status === "published" ? "success" : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  {/* CREATED */}
                  <TableCell>
                    {new Date(page.created_at).toLocaleDateString()}
                  </TableCell>
                  {/* STATE */}
                  <TableCell>
                    <Tooltip title={state.note}>
                      <Chip
                        label={state.label}
                        color={state.color}
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>
                  {/* ACTIONS */}
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      {/* <Tooltip title="Preview Page">
                        <IconButton>
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip> */}

                      <Tooltip title="Edit Page">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="View Sections">
                        <IconButton>
                          <VisibilityIcon
                            onClick={() =>
                              navigate(`/admin/view-section/${page.id}`)
                            }
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Translations">
                        <IconButton>
                          <TranslateIcon
                            onClick={() =>
                              navigate(`/admin/translations-page/${page.id}`)
                            }
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Reports & Analytics">
                        <IconButton>
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Page">
                        <DeleteButton
                          onClick={() => {
                            setSelectedId(page.id);
                            setConfirmDelete(true);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {confirmDelete && (
        <ConfirmDeleteModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => (
            deletePageById(selectedId),
            setConfirmDelete(false)
          )}
          label={"Page"}
        />
      )}
    </Box>
  );
}
