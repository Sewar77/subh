import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export default function AnalyticsTable({ title, columns, rows = [], emptyLabel }) {
  return (
    <Paper variant="outlined" sx={{ minWidth: 0, overflow: "hidden" }}>
      <Typography variant="h6" fontWeight={800} sx={{ p: 2, pb: 1 }}>{title}</Typography>
      {!rows.length ? <Typography color="text.secondary" sx={{ p: 3, pt: 1 }}>{emptyLabel}</Typography> : (
        <TableContainer sx={{ maxWidth: "100%" }}><Table size="small"><TableHead><TableRow><TableCell>#</TableCell>{columns.map((column) => <TableCell key={column.key}>{column.label}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map((row, index) => <TableRow key={row.id || `${title}-${index}`} hover><TableCell>{index + 1}</TableCell>{columns.map((column) => <TableCell key={column.key} sx={{ maxWidth: column.maxWidth || 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: column.wrap ? "normal" : "nowrap" }}>{column.render ? column.render(row) : row[column.key] ?? "—"}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer>
      )}
    </Paper>
  );
}

