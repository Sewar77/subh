import { Box, Paper, Stack, Typography } from "@mui/material";
import { formatAnalyticsDate, formatAnalyticsNumber } from "../../../Utils/analyticsI18n.js";

const colors = { visitors: "#7B2CBF", sessions: "#07B9C8", pageViews: "#D946EF" };

export default function AnalyticsTrendChart({ rows = [], language, title, emptyLabel, labels = {} }) {
  const maximum = Math.max(0, ...rows.flatMap((row) => [row.visitors, row.sessions, row.pageViews].map(Number)));
  if (!rows.length || maximum === 0) return <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}><Typography color="text.secondary">{emptyLabel}</Typography></Paper>;
  const points = (key) => rows.map((row, index) => {
    const x = rows.length === 1 ? 50 : (index / (rows.length - 1)) * 100;
    const y = 94 - (Number(row[key] || 0) / maximum) * 84;
    return `${x},${y}`;
  }).join(" ");
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, overflow: "hidden" }}>
      <Typography variant="h6" fontWeight={800}>{title}</Typography>
      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 1 }}>{Object.entries(colors).map(([key, color]) => <Stack key={key} direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} /><Typography variant="caption">{labels[key] || key}</Typography></Stack>)}</Stack>
      <Box component="svg" role="img" aria-label={title} viewBox="0 0 100 100" preserveAspectRatio="none" sx={{ width: "100%", height: { xs: 210, md: 280 }, mt: 2, overflow: "visible" }}>
        {[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" opacity=".12" vectorEffect="non-scaling-stroke" />)}
        {Object.entries(colors).map(([key, color]) => <polyline key={key} points={points(key)} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
      </Box>
      <Stack direction="row" justifyContent="space-between"><Typography variant="caption">{formatAnalyticsDate(rows[0]?.day, language)}</Typography><Typography variant="caption">{formatAnalyticsNumber(maximum, language)} max</Typography><Typography variant="caption">{formatAnalyticsDate(rows.at(-1)?.day, language)}</Typography></Stack>
    </Paper>
  );
}
