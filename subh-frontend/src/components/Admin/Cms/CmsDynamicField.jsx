import {
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { humanize } from "./cmsUtils.js";

const inputType = (field) => {
  if (field.type === "url") return "url";
  if (field.type === "email") return "email";
  if (["integer", "decimal"].includes(field.type)) return "number";
  return "text";
};

const CharacterCount = ({ value, maxLength }) => {
  if (!maxLength) return null;
  return (
    <Typography
      component="span"
      variant="caption"
      color="text.secondary"
      sx={{ ml: 1 }}
    >
      {String(value ?? "").length}/{maxLength}
    </Typography>
  );
};

function ScalarField({
  field,
  value,
  onChange,
  label,
  direction,
  error,
}) {
  const isNull = value === null;
  const nullToggle = field.nullable ? (
    <FormControlLabel
      control={
        <Checkbox
          checked={isNull}
          onChange={(event) => {
            if (event.target.checked) {
              onChange(null);
              return;
            }
            onChange(field.type === "boolean" ? false : "");
          }}
        />
      }
      label="Store no value"
    />
  ) : null;

  if (field.type === "boolean") {
    return (
      <Stack spacing={0.5}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              disabled={isNull}
              onChange={(event) => onChange(event.target.checked)}
            />
          }
          label={label}
        />
        {nullToggle}
      </Stack>
    );
  }

  const allowedValues = field.allowedValues || field.allowed || [];
  const isMultiline =
    field.multiline === true || field.type === "textarea";

  return (
    <Stack spacing={0.5}>
      <TextField
        fullWidth
        select={allowedValues.length > 0}
        type={inputType(field)}
        label={
          <>
            {label}
            <CharacterCount value={value} maxLength={field.maxLength} />
          </>
        }
        value={value ?? ""}
        required={field.required}
        disabled={isNull}
        multiline={isMultiline}
        minRows={isMultiline ? 4 : undefined}
        inputProps={{
          dir: direction,
          maxLength: field.maxLength,
          step: field.type === "decimal" ? "any" : undefined,
        }}
        error={Boolean(error)}
        helperText={
          error ||
          (field.type === "url"
            ? "Use an approved site-relative, HTTP, HTTPS, mailto, or tel link."
            : "Plain text only.")
        }
        onChange={(event) => {
          if (field.type === "integer") {
            onChange(
              event.target.value === ""
                ? ""
                : Number.parseInt(event.target.value, 10),
            );
            return;
          }
          if (field.type === "decimal") {
            onChange(
              event.target.value === ""
                ? ""
                : Number.parseFloat(event.target.value),
            );
            return;
          }
          onChange(event.target.value);
        }}
      >
        {allowedValues.map((option) => (
          <MenuItem key={option} value={option}>
            {humanize(String(option))}
          </MenuItem>
        ))}
      </TextField>
      {nullToggle}
    </Stack>
  );
}

export function CmsLocalizedField({ field, value = {}, onChange, errors = {} }) {
  const label = field.label || humanize(field.key);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">
        {label}
        {field.required ? " *" : ""}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ScalarField
            field={field}
            label={`${label} — English`}
            direction="ltr"
            value={value?.en ?? ""}
            error={errors.en}
            onChange={(nextValue) =>
              onChange({ ...(value || {}), en: nextValue })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ScalarField
            field={field}
            label={`${label} — العربية`}
            direction="rtl"
            value={value?.ar ?? ""}
            error={errors.ar}
            onChange={(nextValue) =>
              onChange({ ...(value || {}), ar: nextValue })
            }
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export default function CmsDynamicField({
  field,
  value,
  onChange,
  errors = {},
}) {
  if (field.localized) {
    return (
      <CmsLocalizedField
        field={field}
        value={value}
        onChange={onChange}
        errors={errors}
      />
    );
  }

  return (
    <ScalarField
      field={field}
      label={field.label || humanize(field.key)}
      direction="ltr"
      value={value}
      error={errors._field}
      onChange={onChange}
    />
  );
}
