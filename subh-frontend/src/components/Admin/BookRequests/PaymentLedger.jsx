import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatDate, formatMoney, humanizeStatus } from "./bookRequestUi.js";

function EntryDetails({ entry }) {
  return (
    <Stack spacing={0.25}>
      {entry.externalReference && <Typography variant="body2">Reference: {entry.externalReference}</Typography>}
      {entry.purchaseOrderNumber && <Typography variant="body2">PO: {entry.purchaseOrderNumber}</Typography>}
      {entry.note && <Typography variant="body2">Note: {entry.note}</Typography>}
      {entry.voidAudit && (
        <Typography variant="body2" color="error.main">
          Voided {formatDate(entry.voidAudit.voidedAt, true)} by {entry.voidAudit.voidedBy?.name || entry.voidAudit.voidedBy?.email || "administrator"}: {entry.voidAudit.reason}
        </Typography>
      )}
    </Stack>
  );
}

function VoidButton({ entry, onVoid }) {
  return entry.recordStatus === "active" ? (
    <Button
      size="small"
      color="error"
      startIcon={<BlockOutlinedIcon />}
      onClick={() => onVoid(entry)}
      aria-label={`Void ${entry.kind} of ${entry.currency} ${entry.amount}`}
    >
      Void
    </Button>
  ) : null;
}

export default function PaymentLedger({ entries = [], onVoid }) {
  if (entries.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No offline payment or refund entries have been recorded.</Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
        <Table size="small" aria-label="Offline payment ledger">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method / paid date</TableCell>
              <TableCell>References and note</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Recorded by / created</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} sx={entry.recordStatus === "voided" ? { opacity: 0.68 } : undefined}>
                <TableCell>{humanizeStatus(entry.kind)}</TableCell>
                <TableCell>{formatMoney(entry.amount, entry.currency)}</TableCell>
                <TableCell>{humanizeStatus(entry.method)}<br />{formatDate(entry.paidAt, true)}</TableCell>
                <TableCell sx={{ minWidth: 220 }}><EntryDetails entry={entry} /></TableCell>
                <TableCell><Chip size="small" label={humanizeStatus(entry.recordStatus)} color={entry.recordStatus === "voided" ? "error" : "success"} /></TableCell>
                <TableCell>{entry.recordedBy?.name || entry.recordedBy?.email || "—"}<br />{formatDate(entry.createdAt, true)}</TableCell>
                <TableCell align="right"><VoidButton entry={entry} onVoid={onVoid} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
        {entries.map((entry) => (
          <Paper key={entry.id} variant="outlined" sx={{ p: 2, opacity: entry.recordStatus === "voided" ? 0.68 : 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box>
                <Typography fontWeight={800}>{humanizeStatus(entry.kind)} · {formatMoney(entry.amount, entry.currency)}</Typography>
                <Typography variant="body2">{humanizeStatus(entry.method)} · {formatDate(entry.paidAt, true)}</Typography>
              </Box>
              <Chip size="small" label={humanizeStatus(entry.recordStatus)} color={entry.recordStatus === "voided" ? "error" : "success"} />
            </Stack>
            <Box sx={{ mt: 1 }}><EntryDetails entry={entry} /></Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Recorded by {entry.recordedBy?.name || entry.recordedBy?.email || "administrator"} · {formatDate(entry.createdAt, true)}
            </Typography>
            <Box sx={{ mt: 1 }}><VoidButton entry={entry} onVoid={onVoid} /></Box>
          </Paper>
        ))}
      </Stack>
    </>
  );
}
