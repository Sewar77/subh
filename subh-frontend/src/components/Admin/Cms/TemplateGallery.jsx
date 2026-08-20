import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";

export default function TemplateGallery({
  templates = [],
  loading = false,
  error = "",
  onSelectTemplate,
  disabled = false,
}) {
  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((a, b) =>
        (a.name || a.key).localeCompare(b.name || b.key),
      ),
    [templates],
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (sortedTemplates.length === 0) {
    return <Alert severity="info">No section templates are registered.</Alert>;
  }

  return (
    <Grid container spacing={2}>
      {sortedTemplates.map((template) => (
        <Grid item xs={12} sm={6} md={4} key={template.key}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: 4,
                transform: disabled ? "none" : "translateY(-2px)",
              },
            }}
          >
            <CardActionArea
              onClick={() => !disabled && onSelectTemplate(template)}
              disabled={disabled}
              sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    {template.name || template.key}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  {template.fields && template.fields.length > 0 && (
                    <Box mb={1}>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        Content fields: {template.fields.length}
                      </Typography>
                    </Box>
                  )}

                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    gap={0.5}
                  >
                    {template.mediaSlots && template.mediaSlots.length > 0 && (
                      <Chip
                        label={`${template.mediaSlots.length} media slot${template.mediaSlots.length !== 1 ? "s" : ""}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {template.appearance && template.appearance.length > 0 && (
                      <Chip
                        label={`${template.appearance.length} design option${template.appearance.length !== 1 ? "s" : ""}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
