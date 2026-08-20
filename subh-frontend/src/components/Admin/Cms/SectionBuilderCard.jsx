import { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Stack,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Switch,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Alert,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { humanize } from "./cmsUtils.js";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal.jsx";

export default function SectionBuilderCard({
  section,
  busy,
  onEdit,
  onDuplicate,
  onVisibility,
  onArchive,
  onRestore,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}) {
  const [actionError, setActionError] = useState("");
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleArchiveClick = () => {
    setActionError("");
    setArchiveDialogOpen(true);
    handleMenuClose();
  };

  const handleArchiveConfirm = async () => {
    try {
      setActionError("");
      await onArchive(section);
      setArchiveDialogOpen(false);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDuplicate = async () => {
    try {
      setActionError("");
      setDuplicateLoading(true);
      await onDuplicate(section);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDuplicateLoading(false);
      handleMenuClose();
    }
  };

  const handleVisibility = async (event) => {
    try {
      setActionError("");
      await onVisibility(section, event.target.checked);
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          opacity: section.isArchived ? 0.7 : 1,
          transition: "all 0.2s ease",
        }}
      >
        {actionError && (
          <Box sx={{ px: 2, pt: 2 }}>
            <Alert severity="error" onClose={() => setActionError("")}>
              {actionError}
            </Alert>
          </Box>
        )}

        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                ☰ {humanize(section.templateKey)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Position {section.position} · Section #{section.id}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              gap={0.5}
            >
              <Chip
                label={section.isArchived ? "Archived" : "Active"}
                color={section.isArchived ? "warning" : "success"}
                size="small"
                variant={section.isArchived ? "filled" : "outlined"}
              />
              <Chip
                label={section.isVisible ? "Visible" : "Hidden"}
                color={section.isVisible ? "success" : "default"}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </CardContent>

        <Divider />

        <CardActions
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            px: 2,
            py: 1.5,
          }}
        >
          {/* Edit Button */}
          <Button
            size="small"
            startIcon={<EditOutlinedIcon />}
            disabled={busy || duplicateLoading}
            onClick={() => onEdit(section)}
          >
            Edit
          </Button>

          {/* Visibility Toggle */}
          {!section.isArchived && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                ml: "auto",
                borderLeft: "1px solid",
                borderColor: "divider",
                pl: 1,
              }}
            >
              <Tooltip
                title={
                  section.isVisible
                    ? "Click to hide section"
                    : "Click to show section"
                }
              >
                <Switch
                  size="small"
                  checked={section.isVisible}
                  disabled={busy || duplicateLoading}
                  onChange={handleVisibility}
                  inputProps={{
                    "aria-label": `Toggle ${section.templateKey} visibility`,
                  }}
                />
              </Tooltip>
              <Typography variant="caption" sx={{ minWidth: "60px" }}>
                {section.isVisible ? "Visible" : "Hidden"}
              </Typography>
            </Stack>
          )}

          {/* Actions Menu */}
          <Tooltip title="More actions">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              disabled={busy || duplicateLoading}
              aria-label="More actions"
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={handleDuplicate}
            disabled={duplicateLoading}
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            {duplicateLoading && <CircularProgress size={16} />}
            <FileCopyOutlinedIcon fontSize="small" />
            Duplicate
          </MenuItem>

          {!section.isArchived && (
            <MenuItem onClick={onMoveUp} disabled={!canMoveUp || busy}>
              ▲ Move up
            </MenuItem>
          )}

          {!section.isArchived && (
            <MenuItem onClick={onMoveDown} disabled={!canMoveDown || busy}>
              ▼ Move down
            </MenuItem>
          )}

          <Divider />

          {!section.isArchived && (
            <MenuItem
              onClick={handleArchiveClick}
              disabled={busy || duplicateLoading}
            >
              <ArchiveOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
              Archive
            </MenuItem>
          )}

          {section.isArchived && (
            <MenuItem
              onClick={() => onRestore(section)}
              disabled={busy || duplicateLoading}
            >
              <RestoreFromTrashOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
              Restore
            </MenuItem>
          )}
        </Menu>
      </Card>

      {/* Archive Confirmation Dialog */}
      <ConfirmDeleteModal
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleArchiveConfirm}
        title="Archive section?"
        label={section.templateKey}
        message={`Archive this section? It will be removed from the active page builder but can be restored later.`}
        confirmLabel="Archive"
        severity="warning"
        error={actionError}
      />
    </>
  );
}
