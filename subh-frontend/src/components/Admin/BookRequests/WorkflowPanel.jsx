import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { useState } from "react";
import RequestSection from "./RequestSection.jsx";
import RequestStatusChip from "./RequestStatusChip.jsx";
import { STATUS_TRANSITIONS, humanizeStatus } from "./bookRequestUi.js";

function StatusControl({ label, statusType, current, onUpdate }) {
  const options = STATUS_TRANSITIONS[statusType]?.[current] || [];
  const [nextStatus, setNextStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!nextStatus) return;
    setSaving(true);
    setError("");
    try {
      await onUpdate(statusType, nextStatus);
      setNextStatus("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Typography fontWeight={800}>{label}</Typography>
        <RequestStatusChip value={current} />
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {options.length > 0 ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            select
            fullWidth
            size="small"
            label={`Next ${label.toLowerCase()}`}
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
          >
            <MenuItem value="">Select transition</MenuItem>
            {options.map((status) => (
              <MenuItem key={status} value={status}>{humanizeStatus(status)}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<SyncOutlinedIcon />}
            disabled={!nextStatus || saving}
            onClick={save}
            sx={{ minWidth: 128 }}
          >
            {saving ? "Updating…" : "Update"}
          </Button>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">No further supported transitions.</Typography>
      )}
    </Box>
  );
}

export default function WorkflowPanel({ request, admins, onAssign, onStatus }) {
  const [assignedAdminId, setAssignedAdminId] = useState(
    request.assignedAdmin?.id ? String(request.assignedAdmin.id) : "",
  );
  const [assigning, setAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  const saveAssignment = async () => {
    setAssigning(true);
    setAssignmentError("");
    try {
      await onAssign(assignedAdminId ? Number(assignedAdminId) : null);
    } catch (requestError) {
      setAssignmentError(requestError.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Stack spacing={2}>
      <RequestSection title="Assignment" description="Only active administrators can be assigned.">
        {assignmentError && <Alert severity="error" sx={{ mb: 2 }}>{assignmentError}</Alert>}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            select
            fullWidth
            label="Assigned administrator"
            value={assignedAdminId}
            onChange={(event) => setAssignedAdminId(event.target.value)}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {admins.map((admin) => (
              <MenuItem key={admin.id} value={String(admin.id)}>
                {admin.name || admin.fullName || admin.email}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<AssignmentIndOutlinedIcon />}
            onClick={saveAssignment}
            disabled={assigning}
            sx={{ minWidth: 160 }}
          >
            {assigning ? "Saving…" : "Save assignment"}
          </Button>
        </Stack>
      </RequestSection>

      <RequestSection title="Workflow controls" description="Only transitions supported by the backend workflow are offered.">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
          <StatusControl label="Request status" statusType="request" current={request.requestStatus} onUpdate={onStatus} />
          <StatusControl label="Contact status" statusType="contact" current={request.contactStatus} onUpdate={onStatus} />
          <StatusControl label="Quote status" statusType="quote" current={request.quoteStatus} onUpdate={onStatus} />
          <StatusControl label="Fulfillment status" statusType="fulfillment" current={request.fulfillmentStatus} onUpdate={onStatus} />
        </Box>
        <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
          <Typography fontWeight={800}>Payment status — read only</Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <RequestStatusChip value={request.paymentStatus} />
            <Typography variant="body2" color="text.secondary">Updated automatically from the offline-payment ledger.</Typography>
          </Stack>
        </Box>
      </RequestSection>
    </Stack>
  );
}
