import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useId } from "react";

const fieldSx = (smSpan, lgSpan) => ({
  gridColumn: {
    xs: "1 / -1",
    sm: `span ${smSpan}`,
    lg: `span ${lgSpan}`,
  },
  minWidth: 0,
  "& .MuiInputBase-root": { minHeight: 44 },
});

export function CatalogToolbar({
  label,
  activeFilterLabel,
  clearLabel,
  clearDisabled,
  onClear,
  status,
  children,
}) {
  return (
    <Paper
      component="form"
      onSubmit={(event) => event.preventDefault()}
      aria-label={label}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" component="h2">
            {label}
          </Typography>
          {activeFilterLabel && (
            <Chip
              size="small"
              label={activeFilterLabel}
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
        <Button
          type="button"
          variant="outlined"
          startIcon={<RestartAltRoundedIcon />}
          disabled={clearDisabled}
          onClick={onClear}
          sx={{
            minHeight: 40,
            alignSelf: { xs: "stretch", sm: "center" },
            whiteSpace: "nowrap",
            gap: 0.5,
            "& .MuiButton-startIcon": {
              marginInlineStart: 0,
              marginInlineEnd: 0.5,
            },
          }}
        >
          {clearLabel}
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: { xs: 1.25, sm: 1.5 },
          alignItems: "start",
        }}
      >
        {children}
      </Box>
      {status && (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            p: 0,
            m: -1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {status}
        </Box>
      )}
    </Paper>
  );
}

export function CatalogSearchField({
  label,
  placeholder,
  value,
  onChange,
  smSpan = 12,
  lgSpan = 4,
}) {
  return (
    <TextField
      type="search"
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon color="action" />
            </InputAdornment>
          ),
        },
      }}
      sx={fieldSx(smSpan, lgSpan)}
    />
  );
}

export function CatalogSelectField({
  label,
  value,
  onChange,
  options,
  smSpan = 6,
  lgSpan = 2,
}) {
  const labelId = useId();

  return (
    <FormControl sx={fieldSx(smSpan, lgSpan)}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function CatalogNumberField({
  label,
  value,
  onChange,
  smSpan = 6,
  lgSpan = 2,
}) {
  return (
    <TextField
      type="number"
      label={label}
      value={value}
      onChange={onChange}
      slotProps={{
        htmlInput: { min: 0, step: "any", inputMode: "decimal" },
      }}
      sx={fieldSx(smSpan, lgSpan)}
    />
  );
}
