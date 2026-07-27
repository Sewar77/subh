import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function CmsPageSelector({
  pages,
  value,
  disabled,
  onChange,
}) {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="cms-page-selector-label">Fixed page</InputLabel>
      <Select
        labelId="cms-page-selector-label"
        value={value || ""}
        label="Fixed page"
        onChange={(event) => onChange(event.target.value)}
      >
        {pages.map((page) => (
          <MenuItem key={page.id} value={String(page.id)}>
            {page.name || page.key} ({page.key})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
