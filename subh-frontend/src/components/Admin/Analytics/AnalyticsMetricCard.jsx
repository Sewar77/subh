import { Box, Paper, Stack, Typography } from "@mui/material";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { formatAnalyticsNumber, formatAnalyticsPercent } from "../../../Utils/analyticsI18n.js";

export default function AnalyticsMetricCard({ label, value, language, icon, formatter, comparison }) {
  const displayValue = formatter ? formatter(value) : formatAnalyticsNumber(value, language);
  const change = comparison?.percentageChange;
  const TrendIcon = change > 0 ? TrendingUpRoundedIcon : change < 0 ? TrendingDownRoundedIcon : TrendingFlatRoundedIcon;
  return (
    <Paper variant="outlined" sx={{ p: 2.25, minWidth: 0, height: "100%", borderRadius: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={750}>{label}</Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 850, overflowWrap: "anywhere" }}>{displayValue}</Typography>
        </Box>
        {icon && <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>}
      </Stack>
      {comparison && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.25, color: change == null ? "text.secondary" : change >= 0 ? "success.main" : "error.main" }}>
          <TrendIcon fontSize="small" />
          <Typography variant="caption" fontWeight={750}>{change == null ? "—" : formatAnalyticsPercent(change, language)}</Typography>
        </Stack>
      )}
    </Paper>
  );
}

