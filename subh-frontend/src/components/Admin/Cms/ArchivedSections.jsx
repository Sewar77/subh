import { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Collapse,
  Stack,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import { humanize } from "./cmsUtils.js";

export default function ArchivedSections({ sections = [], busy, onRestore }) {
  const [expanded, setExpanded] = useState(false);

  const archivedSections = sections.filter((s) => s.isArchived);

  if (archivedSections.length === 0) {
    return null;
  }

  return (
    <Card variant="outlined">
      <CardHeader
        title={`Archived Sections (${archivedSections.length})`}
        subheader="These sections are no longer in the active page builder but can be restored."
        action={
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="Show archived sections"
            >
              <ExpandMoreIcon
                sx={{
                  transition: "transform 0.3s",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </IconButton>
          </Tooltip>
        }
      />
      <Collapse in={expanded} timeout="auto">
        <CardContent>
          <Stack spacing={2}>
            {archivedSections.map((section) => (
              <Card key={section.id} variant="outlined" sx={{ opacity: 0.7 }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {humanize(section.templateKey)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Section #{section.id}
                      </Typography>
                    </Box>
                    <Chip
                      label="Archived"
                      color="warning"
                      size="small"
                      variant="filled"
                    />
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<RestoreFromTrashOutlinedIcon />}
                    disabled={busy}
                    onClick={() => onRestore(section)}
                  >
                    Restore
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}
