import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CmsDynamicField from "./CmsDynamicField.jsx";
import CmsMediaSlot from "./CmsMediaSlot.jsx";
import { humanize } from "./cmsUtils.js";

const cloneContent = (content) => JSON.parse(JSON.stringify(content || {}));

const buildPatch = (fields, baseline, current) => {
  const patch = {};

  for (const field of fields) {
    const before = baseline[field.key];
    const after = current[field.key];

    if (field.localized) {
      const locales = {};
      for (const locale of ["en", "ar"]) {
        if ((before?.[locale] ?? "") !== (after?.[locale] ?? "")) {
          locales[locale] = after?.[locale] ?? "";
        }
      }
      if (Object.keys(locales).length > 0) patch[field.key] = locales;
      continue;
    }

    if (JSON.stringify(before) !== JSON.stringify(after)) {
      patch[field.key] = after;
    }
  }

  return patch;
};

const approvedLinkPattern = /^(https?:\/\/|mailto:|tel:|\/)(?!\/)/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeScalar = (field, value, path) => {
  if (value === null) {
    return field.nullable
      ? { value: null }
      : { error: `${path} cannot be empty.` };
  }

  if (field.type === "boolean") {
    return typeof value === "boolean"
      ? { value }
      : { error: `${path} must be true or false.` };
  }

  if (field.type === "integer") {
    return Number.isInteger(value)
      ? { value }
      : { error: `${path} must be a whole number.` };
  }

  if (field.type === "decimal") {
    return typeof value === "number" && Number.isFinite(value)
      ? { value }
      : { error: `${path} must be a number.` };
  }

  if (typeof value !== "string") {
    return { error: `${path} must be text.` };
  }

  const normalized = value.trim();
  if (!field.nullable && normalized.length === 0) {
    return { error: `${path} cannot be empty.` };
  }
  if (field.maxLength && normalized.length > field.maxLength) {
    return {
      error: `${path} must not exceed ${field.maxLength} characters.`,
    };
  }
  if (field.type === "url" && !approvedLinkPattern.test(normalized)) {
    return { error: `${path} must be an approved link.` };
  }
  if (field.type === "email" && !emailPattern.test(normalized)) {
    return { error: `${path} must be a valid email address.` };
  }

  const allowedValues = field.allowedValues || field.allowed || [];
  if (allowedValues.length > 0 && !allowedValues.includes(normalized)) {
    return { error: `${path} must use an approved value.` };
  }

  return { value: normalized };
};

const normalizePatch = (fields, patch) => {
  const normalized = {};
  const errors = {};

  for (const [fieldKey, submittedValue] of Object.entries(patch)) {
    const field = fields.find((definition) => definition.key === fieldKey);
    if (!field) {
      errors._general = [`Unknown editable field: ${fieldKey}`];
      continue;
    }

    if (field.localized) {
      normalized[fieldKey] = {};
      for (const [locale, value] of Object.entries(submittedValue)) {
        const result = normalizeScalar(field, value, `${fieldKey}.${locale}`);
        if (result.error) {
          errors[`${fieldKey}.${locale}`] = [result.error];
        } else {
          normalized[fieldKey][locale] = result.value;
        }
      }
      continue;
    }

    const result = normalizeScalar(field, submittedValue, fieldKey);
    if (result.error) {
      errors[fieldKey] = [result.error];
    } else {
      normalized[fieldKey] = result.value;
    }
  }

  return { normalized, errors };
};

const errorsForField = (fieldKey, fieldErrors) => {
  const result = {};
  for (const locale of ["en", "ar"]) {
    const messages = fieldErrors[`${fieldKey}.${locale}`];
    if (messages?.length) result[locale] = messages.join(" ");
  }
  if (fieldErrors[fieldKey]?.length) {
    result._field = fieldErrors[fieldKey].join(" ");
  }
  return result;
};

export default function CmsSectionEditor({
  section,
  busy,
  onDirtyChange,
  onSaveContent,
  onAddMedia,
  onAddMediaAsset,
  onReplaceMedia,
  onReplaceMediaAsset,
  onUpdateMedia,
  onDeleteMedia,
  onReorderMedia,
}) {
  const [baseline, setBaseline] = useState(() => cloneContent(section.content));
  const [content, setContent] = useState(() => cloneContent(section.content));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const fields = useMemo(
    () => section.editingSchema?.fields || [],
    [section.editingSchema?.fields],
  );
  const slots = section.editingSchema?.mediaSlots || [];
  const patch = useMemo(
    () => buildPatch(fields, baseline, content),
    [baseline, content, fields],
  );
  const dirty = Object.keys(patch).length > 0;

  useEffect(() => {
    onDirtyChange(dirty);
    const handleBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, onDirtyChange]);

  useEffect(
    () => () => {
      onDirtyChange(false);
    },
    [onDirtyChange],
  );

  const handleSave = async () => {
    if (!dirty) return;
    const validation = normalizePatch(fields, patch);
    if (Object.keys(validation.errors).length > 0) {
      setError("Correct the highlighted content fields before saving.");
      setFieldErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setFieldErrors({});
      const updated = await onSaveContent(section, validation.normalized);
      const nextContent = cloneContent(updated.content);
      setBaseline(nextContent);
      setContent(nextContent);
    } catch (requestError) {
      setError(requestError.message);
      setFieldErrors(requestError.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography variant="h5">
                Edit {humanize(section.templateKey)}
              </Typography>
              <Typography color="text.secondary">
                Section #{section.id} · Position {section.position}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={section.isArchived ? "Archived" : "Active"}
                color={section.isArchived ? "warning" : "default"}
              />
              <Chip
                label={section.isVisible ? "Visible" : "Hidden"}
                color={section.isVisible ? "success" : "default"}
                variant="outlined"
              />
              {dirty && <Chip label="Unsaved changes" color="info" />}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Content</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fields and validation limits come from the backend editing schema.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              {fieldErrors._general?.map((message) => (
                <Box key={message}>{message}</Box>
              ))}
            </Alert>
          )}

          {fields.length === 0 ? (
            <Typography color="text.secondary">
              This template has no editable text fields.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {fields.map((field) => (
                <CmsDynamicField
                  key={field.key}
                  field={field}
                  value={content[field.key]}
                  errors={errorsForField(field.key, fieldErrors)}
                  onChange={(value) =>
                    setContent((current) => ({
                      ...current,
                      [field.key]: value,
                    }))
                  }
                />
              ))}
            </Stack>
          )}

          <Button
            variant="contained"
            startIcon={
              saving ? <CircularProgress size={18} /> : <SaveOutlinedIcon />
            }
            disabled={!dirty || saving || busy}
            onClick={handleSave}
            sx={{ mt: 3 }}
          >
            Save content
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Media</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Uploads, metadata, ordering, and limits follow each registered media
            slot.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {slots.length === 0 ? (
            <Typography color="text.secondary">
              This template has no media slots.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {slots.map((slot) => (
                <CmsMediaSlot
                  key={slot.key}
                  slot={slot}
                  items={section.media.filter((item) => item.slot === slot.key)}
                  busy={busy}
                  onAdd={(slotDefinition, file, mediaType) =>
                    onAddMedia(section, slotDefinition, file, mediaType)
                  }
                  onAddAsset={(slotDefinition, asset) =>
                    onAddMediaAsset(section, slotDefinition, asset)
                  }
                  onReplace={(item, file) =>
                    onReplaceMedia(section, item, file)
                  }
                  onReplaceAsset={(item, asset) =>
                    onReplaceMediaAsset(section, item, asset)
                  }
                  onSaveMetadata={(item, metadata) =>
                    onUpdateMedia(section, item, metadata)
                  }
                  onDelete={(item) => onDeleteMedia(section, item)}
                  onReorder={(slotDefinition, media) =>
                    onReorderMedia(section, slotDefinition, media)
                  }
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
