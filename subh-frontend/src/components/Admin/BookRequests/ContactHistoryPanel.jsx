import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcCallOutlinedIcon from "@mui/icons-material/AddIcCallOutlined";
import { useState } from "react";
import RequestSection from "./RequestSection.jsx";
import {
  CONTACT_METHODS,
  CONTACT_OUTCOMES,
  formatDate,
  humanizeStatus,
} from "./bookRequestUi.js";

export default function ContactHistoryPanel({ history, onRecord }) {
  const [form, setForm] = useState({
    contactMethod: "phone",
    outcome: "no_answer",
    note: "",
    nextFollowUpAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      contactMethod: form.contactMethod,
      outcome: form.outcome,
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
      ...(form.nextFollowUpAt
        ? { nextFollowUpAt: new Date(form.nextFollowUpAt).toISOString() }
        : {}),
    };
    try {
      await onRecord(payload);
      setForm((current) => ({ ...current, note: "", nextFollowUpAt: "" }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequestSection title="Contact history" description="Record customer contact and schedule the next follow-up.">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={submit}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
          <TextField select label="Contact method" value={form.contactMethod} onChange={(event) => setForm({ ...form, contactMethod: event.target.value })}>
            {CONTACT_METHODS.map((method) => <MenuItem key={method} value={method}>{humanizeStatus(method)}</MenuItem>)}
          </TextField>
          <TextField select label="Outcome" value={form.outcome} onChange={(event) => setForm({ ...form, outcome: event.target.value })}>
            {CONTACT_OUTCOMES.map((outcome) => <MenuItem key={outcome} value={outcome}>{humanizeStatus(outcome)}</MenuItem>)}
          </TextField>
          <TextField label="Contact note" multiline minRows={2} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} inputProps={{ maxLength: 2000 }} />
          <TextField label="Next follow-up" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.nextFollowUpAt} onChange={(event) => setForm({ ...form, nextFollowUpAt: event.target.value })} />
        </Box>
        <Button type="submit" variant="contained" startIcon={<AddIcCallOutlinedIcon />} disabled={saving} sx={{ mt: 2 }}>
          {saving ? "Recording…" : "Record contact"}
        </Button>
      </Box>
      <Divider sx={{ my: 3 }} />
      {history.length === 0 ? (
        <Typography color="text.secondary">No contact history has been recorded.</Typography>
      ) : (
        <Stack spacing={0}>
          {history.map((entry, index) => (
            <Box key={entry.id} sx={{ position: "relative", pl: 3.5, pb: index === history.length - 1 ? 0 : 3 }}>
              <Box sx={{ position: "absolute", left: 4, top: 6, width: 12, height: 12, borderRadius: "50%", bgcolor: "secondary.main" }} />
              {index !== history.length - 1 && <Box sx={{ position: "absolute", left: 9, top: 18, bottom: 0, width: 2, bgcolor: "divider" }} />}
              <Typography fontWeight={900}>{humanizeStatus(entry.contactMethod)} — {humanizeStatus(entry.outcome)}</Typography>
              <Typography variant="body2">{entry.note || "No note."}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {entry.admin?.name || "Administrator"} · {formatDate(entry.contactedAt, true)}
              </Typography>
              {entry.nextFollowUpAt && (
                <Typography variant="caption" color="warning.main" fontWeight={800}>
                  Follow-up: {formatDate(entry.nextFollowUpAt, true)}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </RequestSection>
  );
}
