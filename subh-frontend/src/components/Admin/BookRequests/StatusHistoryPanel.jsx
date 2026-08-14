import { Box, Stack, Typography } from "@mui/material";
import RequestSection from "./RequestSection.jsx";
import { formatDate, humanizeStatus } from "./bookRequestUi.js";

export default function StatusHistoryPanel({ history }) {
  return (
    <RequestSection title="Status history" description="Immutable workflow changes recorded by the backend.">
      {history.length === 0 ? (
        <Typography color="text.secondary">No status changes have been recorded.</Typography>
      ) : (
        <Stack spacing={0}>
          {history.map((entry, index) => (
            <Box key={entry.id} sx={{ position: "relative", pl: 3.5, pb: index === history.length - 1 ? 0 : 3 }}>
              <Box sx={{ position: "absolute", left: 4, top: 6, width: 12, height: 12, borderRadius: "50%", bgcolor: "primary.main" }} />
              {index !== history.length - 1 && <Box sx={{ position: "absolute", left: 9, top: 18, bottom: 0, width: 2, bgcolor: "divider" }} />}
              <Typography fontWeight={900}>{humanizeStatus(entry.statusType)} status</Typography>
              <Typography>
                {humanizeStatus(entry.oldStatus)} → {humanizeStatus(entry.newStatus)}
              </Typography>
              {entry.note && <Typography variant="body2">{entry.note}</Typography>}
              <Typography variant="caption" color="text.secondary">
                {entry.changedBy?.name || "Administrator"} · {formatDate(entry.createdAt, true)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </RequestSection>
  );
}
