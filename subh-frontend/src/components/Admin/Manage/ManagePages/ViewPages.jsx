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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SettingsIcon from "@mui/icons-material/Settings";
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Pages Control Center</Typography>

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
            <TableRow
              sx={{
                textAlign: "center",
              }}
            >
              <TableCell>Page</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Actions</TableCell>
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
                      sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                    >
                      <Tooltip title="Edit page settings">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage sections">
                        <IconButton>
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Preview page">
                        <IconButton>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete page">
                        <DeleteButton
                          onClick={() => {
                            (setConfirmDelete(true), setSelectedId(page.id));
                          }}
                        />
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
