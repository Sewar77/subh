import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import { humanize } from "./cmsUtils.js";

export default function CmsSectionList({
  sections,
  selectedSectionId,
  busy,
  onEdit,
  onMove,
  onVisibility,
  onArchive,
  onRestore,
}) {
  const [archiveTarget, setArchiveTarget] = useState(null);
  const orderedSections = [...sections].sort(
    (left, right) => left.position - right.position,
  );

  if (orderedSections.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            This fixed page has no section instances.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {orderedSections.map((section, index) => (
        <Card
          key={section.id}
          variant="outlined"
          sx={{
            borderColor:
              String(selectedSectionId) === String(section.id)
                ? "primary.main"
                : "divider",
            opacity: section.isArchived ? 0.78 : 1,
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={2}
            >
              <Box>
                <Typography variant="h6">
                  {humanize(section.templateKey)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Position {section.position} · Section #{section.id}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={section.isArchived ? "Archived" : "Active"}
                  color={section.isArchived ? "warning" : "default"}
                  variant={section.isArchived ? "filled" : "outlined"}
                />
                <Chip
                  label={section.isVisible ? "Visible" : "Hidden"}
                  color={section.isVisible ? "success" : "default"}
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </CardContent>
          <CardActions
            sx={{
              px: 2,
              pb: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Button
              startIcon={<EditOutlinedIcon />}
              disabled={busy}
              onClick={() => onEdit(section)}
            >
              Edit
            </Button>
            <Tooltip title="Move section up">
              <span>
                <IconButton
                  aria-label={`Move ${section.templateKey} section up`}
                  disabled={busy || index === 0}
                  onClick={() => onMove(index, index - 1)}
                >
                  <ArrowUpwardIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move section down">
              <span>
                <IconButton
                  aria-label={`Move ${section.templateKey} section down`}
                  disabled={busy || index === orderedSections.length - 1}
                  onClick={() => onMove(index, index + 1)}
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Stack direction="row" alignItems="center">
              <Switch
                checked={section.isVisible}
                disabled={busy || section.isArchived}
                inputProps={{
                  "aria-label": `${section.templateKey} section visibility`,
                }}
                onChange={(event) =>
                  onVisibility(section, event.target.checked)
                }
              />
              <Typography variant="body2">
                {section.isVisible ? "Visible" : "Hidden"}
              </Typography>
            </Stack>
            {section.isArchived ? (
              <Button
                startIcon={<RestoreFromTrashOutlinedIcon />}
                disabled={busy}
                onClick={() => onRestore(section)}
              >
                Restore section
              </Button>
            ) : (
              <Button
                color="warning"
                startIcon={<ArchiveOutlinedIcon />}
                disabled={busy}
                onClick={() => setArchiveTarget(section)}
              >
                Archive section
              </Button>
            )}
          </CardActions>
        </Card>
      ))}

      <Dialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
      >
        <DialogTitle>Archive section?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The section will stop rendering publicly but remains available for
            restoration and editing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveTarget(null)}>Cancel</Button>
          <Button
            color="warning"
            onClick={async () => {
              const target = archiveTarget;
              setArchiveTarget(null);
              await onArchive(target);
            }}
          >
            Archive section
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
