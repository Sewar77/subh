import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TranslateIcon from "@mui/icons-material/Translate";
import ImageIcon from "@mui/icons-material/Image";

import { usePages } from "../../../../Hooks/usePages";
import SectionsFilters from "../../Search and Filter/SectionsFilters";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";

export default function ViewAllSections() {
  const {
    fetchAllSections,
    allSections,
    fetchAllPages,
    pages,
    fetchTemplates,
    templates,
    deleteSection,
  } = usePages();

  const [search, setSearch] = useState("");
  const [pageFilter, setPageFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");

  useEffect(() => {
    fetchAllSections();
    fetchAllPages();
    fetchTemplates();
  }, []);

  const filteredSections = useMemo(() => {
    return (allSections || []).filter((s) => {
      const matchSearch =
        s.type?.toLowerCase().includes(search.toLowerCase()) ||
        s.status?.toLowerCase().includes(search.toLowerCase()) ||
        s.page_key?.toLowerCase().includes(search.toLowerCase());

      const matchPage = pageFilter ? s.page_key === pageFilter : true;
      const matchTemplate = templateFilter
        ? s.template_key === templateFilter
        : true;

      return matchSearch && matchPage && matchTemplate;
    });
  }, [allSections, search, pageFilter, templateFilter]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER */}
      <Typography variant="h4" fontWeight={700}>
        Sections Control Center
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={3}>
        Search, filter, and manage all page sections in one place.
      </Typography>

      {/* FILTERS */}
      <SectionsFilters
        search={search}
        setSearch={setSearch}
        pages={pages}
        templates={templates}
        pageFilter={pageFilter}
        setPageFilter={setPageFilter}
        templateFilter={templateFilter}
        setTemplateFilter={setTemplateFilter}
      />

      {/* SECTIONS */}
      {filteredSections.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            bgcolor: "#f8fafc",
            border: "1px dashed #cbd5e1",
          }}
        >
          <Typography variant="h5" fontWeight={700} mb={1}>
            No sections found
          </Typography>

          <Typography color="text.secondary" mb={2}>
            There are no sections matching your current filters.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Try changing the page filter, template filter, or search query.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {filteredSections.map((s, idx) => (
            <Paper
              key={s.id}
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 4,
                borderLeft: s.is_visible
                  ? "6px solid #22c55e"
                  : "6px solid #ef4444",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                },
              }}
            >
              {/* HEADER */}
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{ letterSpacing: 0.2 }}
                  >
                    Section #{idx + 1}
                  </Typography>

                  <Typography color="text.secondary" fontSize="1rem">
                    <b>Page:</b> {s.page_key} • <b>Template:</b>{" "}
                    {s.template_name}
                  </Typography>
                </Box>

                <Chip
                  label={s.is_visible ? "Visible" : "Hidden"}
                  color={s.is_visible ? "success" : "error"}
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    px: 1,
                  }}
                />
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              {/* META */}
              <Stack
                direction="row"
                spacing={1.2}
                sx={{ justifyContent: "center", flexWrap: "wrap" }}
              >
                <Chip label={`Type: ${s.type}`} />
                <Chip label={`Position: ${s.position}`} />
                <Chip label={s.status} />
                <Chip label={`Translations: ${s.translations?.length || 0}`} />
                <Chip label={`Media: ${s.media?.length || 0}`} />
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              {/* ACTIONS */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ justifyContent: "center" }}
              >
                <Tooltip title="Preview">
                  <IconButton sx={{ bgcolor: "#f1f5f9" }}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit">
                  <IconButton sx={{ bgcolor: "#f1f5f9" }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Translations">
                  <IconButton sx={{ bgcolor: "#f1f5f9" }}>
                    <TranslateIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Media">
                  <IconButton sx={{ bgcolor: "#f1f5f9" }}>
                    <ImageIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                  <IconButton color="error" sx={{ bgcolor: "#fef2f2" }}>
                    <DeleteIcon
                      onClick={() => {
                        (setConfirmDelete(true), setSelectedId(s.id));
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => (deleteSection(selectedId), setConfirmDelete(false))}
          label={"User"}
        />
      )}
    </Box>
  );
}
