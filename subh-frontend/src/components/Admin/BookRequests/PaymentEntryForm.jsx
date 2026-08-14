import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import {
  Alert,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const PAYMENT_METHODS = [
  "bank_transfer",
  "wire_transfer",
  "ach",
  "check",
  "cash",
  "other",
];

const methodLabel = (value) =>
  value
    .split("_")
    .map((part) => part.toUpperCase() === "ACH" ? "ACH" : `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");

const localDateTime = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const initialForm = () => ({
  amount: "",
  method: "bank_transfer",
  paidAt: localDateTime(),
  externalReference: "",
  purchaseOrderNumber: "",
  note: "",
});

export default function PaymentEntryForm({ kind, disabled, helperText, maxAmount, onSubmit }) {
  const isRefund = kind === "refund";
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!/^\d{1,12}(?:\.\d{1,2})?$/.test(form.amount) || Number(form.amount) <= 0) {
      nextErrors.amount = "Enter a positive amount with no more than two decimal places.";
    } else if (maxAmount !== undefined && Number(form.amount) > Number(maxAmount)) {
      nextErrors.amount = isRefund
        ? "The refund cannot exceed the current backend net paid amount."
        : "The payment cannot exceed the current backend remaining balance.";
    }
    if (!form.paidAt || new Date(form.paidAt).getTime() > Date.now()) {
      nextErrors.paidAt = "Choose a payment date that is not in the future.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        amount: form.amount,
        method: form.method,
        paidAt: new Date(form.paidAt).toISOString(),
        ...(form.externalReference.trim() && {
          externalReference: form.externalReference.trim(),
        }),
        ...(!isRefund && form.purchaseOrderNumber.trim() && {
          purchaseOrderNumber: form.purchaseOrderNumber.trim(),
        }),
        ...(form.note.trim() && { note: form.note.trim() }),
      };
      await onSubmit(payload);
      setForm(initialForm());
      setFieldErrors({});
    } catch (requestError) {
      setError(requestError.message);
      setFieldErrors(requestError.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={submit}
      spacing={2}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}
    >
      <div>
        <Typography variant="h6">
          {isRefund ? "Record refund" : "Record payment"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isRefund
            ? "Record money returned through an offline method. The backend enforces the refundable limit."
            : "Record money received outside Subh. Subh never collects card credentials."}
        </Typography>
      </div>
      {helperText && <Alert severity={disabled ? "info" : "success"}>{helperText}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        required
        label="Amount"
        value={form.amount}
        onChange={update("amount")}
        error={Boolean(fieldErrors.amount)}
        helperText={fieldErrors.amount}
        disabled={disabled || saving}
        inputProps={{ inputMode: "decimal" }}
      />
      <TextField
        required
        select
        label="Offline method"
        value={form.method}
        onChange={update("method")}
        disabled={disabled || saving}
      >
        {PAYMENT_METHODS.map((method) => (
          <MenuItem key={method} value={method}>{methodLabel(method)}</MenuItem>
        ))}
      </TextField>
      <TextField
        required
        type="datetime-local"
        label={isRefund ? "Refunded at" : "Paid at"}
        value={form.paidAt}
        onChange={update("paidAt")}
        error={Boolean(fieldErrors.paidAt)}
        helperText={fieldErrors.paidAt}
        disabled={disabled || saving}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="External reference (optional)"
        value={form.externalReference}
        onChange={update("externalReference")}
        disabled={disabled || saving}
        inputProps={{ maxLength: 200 }}
      />
      {!isRefund && (
        <TextField
          label="Purchase order number (optional)"
          value={form.purchaseOrderNumber}
          onChange={update("purchaseOrderNumber")}
          disabled={disabled || saving}
          inputProps={{ maxLength: 200 }}
        />
      )}
      <TextField
        multiline
        minRows={2}
        label="Note (optional)"
        value={form.note}
        onChange={update("note")}
        disabled={disabled || saving}
        inputProps={{ maxLength: 2000 }}
      />
      <Button
        type="submit"
        variant="contained"
        color={isRefund ? "warning" : "primary"}
        startIcon={isRefund ? <ReplayOutlinedIcon /> : <PaymentsOutlinedIcon />}
        disabled={disabled || saving}
        sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: 180 }}
      >
        {saving ? "Saving…" : isRefund ? "Record refund" : "Record payment"}
      </Button>
    </Stack>
  );
}
