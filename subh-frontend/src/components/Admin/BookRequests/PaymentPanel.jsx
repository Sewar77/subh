import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import {
  Alert,
  Box,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal.jsx";
import { formatMoney } from "./bookRequestUi.js";
import PaymentEntryForm from "./PaymentEntryForm.jsx";
import PaymentLedger from "./PaymentLedger.jsx";
import RequestSection from "./RequestSection.jsx";
import RequestStatusChip from "./RequestStatusChip.jsx";

function SummaryValue({ label, value, currency }) {
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.5, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography fontWeight={800} sx={{ overflowWrap: "anywhere" }}>{formatMoney(value, currency)}</Typography>
    </Box>
  );
}

export default function PaymentPanel({ request, onRecordPayment, onRecordRefund, onVoid }) {
  const summary = request.paymentSummary;
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);
  const [voidError, setVoidError] = useState("");

  if (!summary) {
    return (
      <RequestSection title="Offline payments">
        <Alert severity="warning">The authoritative payment summary is unavailable for this request.</Alert>
      </RequestSection>
    );
  }

  const workflowAllowsPayment =
    !["cancelled", "rejected"].includes(request.requestStatus) &&
    (request.quoteStatus === "accepted" || ["confirmed", "completed"].includes(request.requestStatus));
  const hasFinalTotal = Number(summary.finalTotal) > 0;
  const paymentEnabled = workflowAllowsPayment && hasFinalTotal && Number(summary.remainingBalance) > 0;
  const refundEnabled = Number(summary.netPaid) > 0;
  const currency = summary.currency || "USD";

  const closeVoid = () => {
    if (voiding) return;
    setVoidTarget(null);
    setVoidReason("");
    setVoidError("");
  };

  const confirmVoid = async () => {
    if (!voidTarget || voidReason.trim().length < 3) return;
    setVoiding(true);
    setVoidError("");
    try {
      await onVoid(voidTarget.id, voidReason.trim());
      setVoidTarget(null);
      setVoidReason("");
    } catch (requestError) {
      setVoidError(requestError.message);
    } finally {
      setVoiding(false);
    }
  };

  return (
    <RequestSection
      title="Offline payments"
      description="Record offline money movement only. Backend balances and payment status are authoritative."
      action={<AccountBalanceWalletOutlinedIcon color="primary" aria-hidden="true" />}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(6, minmax(0, 1fr))" }, gap: 1.5 }}>
        <SummaryValue label="Final total" value={summary.finalTotal} currency={currency} />
        <SummaryValue label="Total payments" value={summary.totalPayments} currency={currency} />
        <SummaryValue label="Total refunds" value={summary.totalRefunds} currency={currency} />
        <SummaryValue label="Net paid" value={summary.netPaid} currency={currency} />
        <SummaryValue label="Remaining" value={summary.remainingBalance} currency={currency} />
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Payment status</Typography>
          <Box sx={{ mt: 0.5 }}><RequestStatusChip value={summary.paymentStatus} /></Box>
          <Typography variant="caption" color="text.secondary">{currency}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 1.5 }}>Ledger</Typography>
      <PaymentLedger entries={request.payments || []} onVoid={(entry) => setVoidTarget(entry)} />

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 1.5 }}>Record offline activity</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        <PaymentEntryForm
          kind="payment"
          disabled={!paymentEnabled}
          maxAmount={summary.remainingBalance}
          helperText={paymentEnabled
            ? `Backend remaining balance: ${formatMoney(summary.remainingBalance, currency)}.`
            : "Payments require a positive final total and an accepted quote or confirmed request with a remaining balance."}
          onSubmit={onRecordPayment}
        />
        <PaymentEntryForm
          kind="refund"
          disabled={!refundEnabled}
          maxAmount={summary.netPaid}
          helperText={refundEnabled
            ? `Backend refundable net paid: ${formatMoney(summary.netPaid, currency)}.`
            : "A refund can be recorded only after the request has active net payments."}
          onSubmit={onRecordRefund}
        />
      </Box>

      <ConfirmDeleteModal
        open={Boolean(voidTarget)}
        onCancel={closeVoid}
        onConfirm={confirmVoid}
        title="Void ledger entry"
        confirmLabel="Void entry"
        cancelLabel="Keep entry"
        message={voidTarget
          ? `Void this ${voidTarget.kind} of ${formatMoney(voidTarget.amount, voidTarget.currency)}? This is an audited correction, not a deletion. The entry will remain visible with its reason, and the backend will recalculate balances and payment status.`
          : ""}
        loading={voiding}
        error={voidError}
        confirmDisabled={voidReason.trim().length < 3}
        confirmAutoFocus={false}
      >
        <Stack spacing={0.75} sx={{ mt: 2 }}>
          <TextField
            required
            autoFocus
            multiline
            minRows={2}
            label="Void reason"
            value={voidReason}
            onChange={(event) => setVoidReason(event.target.value)}
            inputProps={{ maxLength: 1000 }}
            error={Boolean(voidReason) && voidReason.trim().length < 3}
            helperText="Required. Explain the correction for the audit ledger."
            disabled={voiding}
          />
        </Stack>
      </ConfirmDeleteModal>
    </RequestSection>
  );
}
