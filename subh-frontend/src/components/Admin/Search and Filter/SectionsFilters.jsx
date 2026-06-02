import { Box, TextField, MenuItem, Paper, Stack } from "@mui/material";

export default function SectionsFilters({
  search,
  setSearch,
  pages = [],
  templates = [],
  pageFilter,
  setPageFilter,
  templateFilter,
  setTemplateFilter,
}) {
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {/* SEARCH */}
        <TextField
          fullWidth
          label="Search sections"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          helperText="Search by type, status, page key..."
        />

        {/* PAGE FILTER */}
        <TextField
          select
          fullWidth
          label="Filter by Page"
          value={pageFilter}
          onChange={(e) => setPageFilter(e.target.value)}
        >
          <MenuItem value="">All Pages</MenuItem>
          {pages.map((p) => (
            <MenuItem key={p.id} value={p.key}>
              {p.key}
            </MenuItem>
          ))}
        </TextField>

        {/* TEMPLATE FILTER */}
        <TextField
          select
          fullWidth
          label="Filter by Template"
          value={templateFilter}
          onChange={(e) => setTemplateFilter(e.target.value)}
        >
          <MenuItem value="">All Templates</MenuItem>
          {templates.map((t) => (
            <MenuItem key={t.id} value={t.key}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Paper>
  );
}
