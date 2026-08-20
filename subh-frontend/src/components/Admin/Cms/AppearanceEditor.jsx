import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

const buildAppearancePatch = (baseline, current, controls) => {
  const patch = {};
  for (const control of controls) {
    const before = baseline[control.key];
    const after = current[control.key];
    if (before !== after) {
      patch[control.key] = after || null;
    }
  }
  return patch;
};

export default function AppearanceEditor({
  section,
  editingSchema,
  busy,
  onSaveAppearance,
}) {
  const appearanceControls = useMemo(
    () => editingSchema?.appearance || [],
    [editingSchema?.appearance],
  );

  const [baseline, setBaseline] = useState(() => section.appearance || {});
  const [current, setCurrent] = useState(() => section.appearance || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const patch = useMemo(
    () => buildAppearancePatch(baseline, current, appearanceControls),
    [baseline, current, appearanceControls],
  );

  const isDirty = Object.keys(patch).length > 0;

  const handleSave = async () => {
    if (!isDirty) return;

    try {
      setSaving(true);
      setError("");
      const updated = await onSaveAppearance(section, patch);
      setBaseline(updated.appearance || {});
      setCurrent(updated.appearance || {});
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (controlKey, value) => {
    setCurrent((prev) => ({
      ...prev,
      [controlKey]: value,
    }));
  };

  if (appearanceControls.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            This template has no design options available.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Design
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Customize the appearance of this section using the available design
          controls.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          {appearanceControls.map((control) => {
            if (control.type === "select" && control.values) {
              return (
                <FormControl
                  key={control.key}
                  fullWidth
                  size="small"
                  variant="outlined"
                >
                  <InputLabel id={`appearance-${control.key}-label`}>
                    {control.label || control.key}
                  </InputLabel>
                  <Select
                    labelId={`appearance-${control.key}-label`}
                    id={`appearance-${control.key}`}
                    value={current[control.key] || ""}
                    label={control.label || control.key}
                    onChange={(event) =>
                      handleChange(control.key, event.target.value)
                    }
                    disabled={busy || saving}
                  >
                    <MenuItem value="">
                      <em>Default</em>
                    </MenuItem>
                    {control.values.map((val) => (
                      <MenuItem key={val} value={val}>
                        {val
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }
            return null;
          })}
        </Stack>

        <Button
          variant="contained"
          startIcon={
            saving ? <CircularProgress size={18} /> : <SaveOutlinedIcon />
          }
          disabled={!isDirty || saving || busy}
          onClick={handleSave}
          sx={{ mt: 3 }}
        >
          Save design
        </Button>
      </CardContent>
    </Card>
  );
}
