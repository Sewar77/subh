import { Button, MenuItem, Stack, TextField } from "@mui/material";

export default function AnalyticsDateRange({ value, onChange, onApply, copy }) {
  const set = (field) => (event) => onChange({ ...value, [field]: event.target.value });
  return (
    <Stack component="form" onSubmit={(event) => { event.preventDefault(); onApply(); }} direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
      <TextField select size="small" label={copy.dateRange} value={value.preset} onChange={set("preset")} sx={{ minWidth: 180 }}>
        <MenuItem value="7d">{copy.sevenDays}</MenuItem><MenuItem value="30d">{copy.thirtyDays}</MenuItem><MenuItem value="90d">{copy.ninetyDays}</MenuItem><MenuItem value="year">{copy.thisYear}</MenuItem><MenuItem value="custom">{copy.custom}</MenuItem>
      </TextField>
      {value.preset === "custom" && <><TextField size="small" type="date" label={copy.from} value={value.dateFrom} onChange={set("dateFrom")} InputLabelProps={{ shrink: true }} required /><TextField size="small" type="date" label={copy.to} value={value.dateTo} onChange={set("dateTo")} InputLabelProps={{ shrink: true }} required /></>}
      <Button type="submit" variant="contained">{copy.apply}</Button>
    </Stack>
  );
}
