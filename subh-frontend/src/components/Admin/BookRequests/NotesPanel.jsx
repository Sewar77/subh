import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useState } from "react";
import RequestSection from "./RequestSection.jsx";

export default function NotesPanel({ notes, onSave }) {
  const [customerVisibleNote, setCustomerVisibleNote] = useState(
    notes.customerVisibleAdmin || "",
  );
  const [adminInternalNote, setAdminInternalNote] = useState(
    notes.adminInternal || "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave({
        customerVisibleNote: customerVisibleNote.trim() || null,
        adminInternalNote: adminInternalNote.trim() || null,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequestSection title="Notes" description="Customer, visible-administrator, and internal notes have separate visibility.">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
          <Typography fontWeight={900}>Customer note — read only</Typography>
          <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{notes.customer || "No customer note."}</Typography>
        </Box>
        <TextField
          label="Customer-visible admin note"
          multiline
          minRows={3}
          value={customerVisibleNote}
          onChange={(event) => setCustomerVisibleNote(event.target.value)}
          helperText="This text is visible to the requesting customer."
          inputProps={{ maxLength: 4000 }}
        />
        <Alert severity="warning" icon={false}>
          <Typography fontWeight={900}>ADMIN ONLY</Typography>
          <TextField
            label="Internal admin note"
            multiline
            minRows={3}
            fullWidth
            value={adminInternalNote}
            onChange={(event) => setAdminInternalNote(event.target.value)}
            helperText="Never displayed through customer request endpoints."
            inputProps={{ maxLength: 4000 }}
            sx={{ mt: 1, bgcolor: "background.paper" }}
          />
        </Alert>
        <Box>
          <Button variant="contained" startIcon={<SaveOutlinedIcon />} disabled={saving} onClick={save}>
            {saving ? "Saving notes…" : "Save notes"}
          </Button>
        </Box>
      </Stack>
    </RequestSection>
  );
}
