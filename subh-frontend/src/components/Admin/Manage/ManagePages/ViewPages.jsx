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
  MenuItem,
  Menu,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import TranslateIcon from "@mui/icons-material/Translate";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { usePages } from "../../../../Hooks/usePages";
import AddButton from "../../Buttons/AddBtn";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DeleteButton from "../../Buttons/DeleteBtn";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import SectionsFilters from "../../Search and Filter/SectionsFilters";
import Title from "../../Headers/Titles";

export default function ViewPages() {
  const {
    pages,
    fetchAllPages,
    loading,
    deletePageById,
    templates,
    fetchTemplates,
  } = usePages();

  const [search, setSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuPageId, setMenuPageId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchAllPages();
    fetchTemplates();
  }, []);
  const getCompletionState = (page) => {
    const hasTemplate = !!page.template_id;
    const hasStatus = page.status === "published";
    const hasKey = !!page.key;
    if (!hasKey)
      return { label: "Broken", color: "error", note: "Missing key" };
    if (!hasTemplate)
      return { label: "Unassigned", color: "warning", note: "No template" };
    if (!hasStatus)
      return { label: "In Progress", color: "warning", note: "Not published" };
    return { label: "Ready", color: "success", note: "Fully configured" };
  };
  const filtered = useMemo(() => {
    return (pages || []).filter((p) => {
      const key = (p.key || "").toLowerCase();
      const templateName = (p.template_name || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      const searchQ = search.toLowerCase();
      const matchSearch =
        key.includes(searchQ) || templateName.includes(searchQ);
      const matchTemplate = templateFilter
        ? p.template_key === templateFilter
        : true;
      const matchStatus = statusFilter
        ? status === statusFilter.toLowerCase()
        : true;
      const state = getCompletionState(p);
      const matchState = stateFilter
        ? state.label.toLowerCase() === stateFilter.toLowerCase()
        : true;
      return matchSearch && matchTemplate && matchStatus && matchState;
    });
  }, [pages, search, templateFilter, statusFilter, stateFilter]);

  return (
    <Box sx={{ p: 3 }}>
      <Title
        title={" Pages Control Center"}
        caption={"Manage pages, templates, and publishing state."}
      />
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <SectionsFilters
        search={search}
        setSearch={setSearch}
        pages={pages}
        templates={templates}
        pageFilter={""}
        setPageFilter={() => {}}
        templateFilter={templateFilter}
        setTemplateFilter={setTemplateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Page</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>State</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((page) => {
              const state = getCompletionState(page);

              return (
                <TableRow key={page.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{page.key}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={page.template_name || "No template"}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={page.status}
                      color={
                        page.status === "published" ? "success" : "warning"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {new Date(page.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Tooltip title={state.note}>
                      <Chip
                        label={state.label}
                        color={state.color}
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/edit-page/${page.id}`)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="View Page">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/view-page/${page.id}`)
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Translations">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/translations-page/${page.id}`)
                          }
                        >
                          <TranslateIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="View Sections">
                        <IconButton
                          onClick={() =>
                            navigate(`/admin/view-section/${page.id}`)
                          }
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <DeleteButton
                          onClick={() => {
                            setSelectedId(page.id);
                            setConfirmDelete(true);
                          }}
                        />
                      </Tooltip>

                      <Tooltip title="More Actions">
                        <IconButton
                          sx={{ transform: "scale(1.15)" }}
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setMenuPageId(page.id);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>

                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl && menuPageId === page.id)}
                        onClose={() => setAnchorEl(null)}
                      >
                        <MenuItem sx={{ fontSize: "1rem" }}>
                          Quick Edit
                        </MenuItem>

                        <MenuItem sx={{ fontSize: "1rem" }}>
                          Duplicate Page
                        </MenuItem>

                        <MenuItem sx={{ fontSize: "1rem" }}>
                          View Sections
                        </MenuItem>

                        <MenuItem sx={{ fontSize: "1rem" }}>
                          Preview Page
                        </MenuItem>

                        <MenuItem
                          sx={{ fontSize: "1rem", color: "error.main" }}
                        >
                          Force Publish Check
                        </MenuItem>
                      </Menu>
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
          onConfirm={() => {
            deletePageById(selectedId);
            setConfirmDelete(false);
          }}
          label="Page"
        />
      )}
    </Box>
  );
}
