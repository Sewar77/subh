import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PriceCheckOutlinedIcon from "@mui/icons-material/PriceCheckOutlined";
import { useMemo, useState } from "react";
import RequestSection from "./RequestSection.jsx";
import { dateInputValue, formatMoney } from "./bookRequestUi.js";

const editableStatuses = new Set(["not_prepared", "draft", "declined", "expired"]);

const initialForm = (request) => ({
  items: request.items.map((item) => ({
    itemId: item.id,
    nameEn: item.nameEn,
    nameAr: item.nameAr,
    agreedQuantity: String(item.agreedQuantity ?? item.requestedQuantity),
    agreedUnitPrice: String(item.agreedUnitPrice ?? item.unitPriceSnapshot ?? ""),
  })),
  shippingCost: String(request.quote.shippingCost ?? "0.00"),
  discountAmount: String(request.quote.discountAmount ?? "0.00"),
  taxAmount: String(request.quote.taxAmount ?? "0.00"),
  quoteValidUntil: dateInputValue(request.quote.validUntil),
});

export default function QuoteEditor({ request, onSave }) {
  const [form, setForm] = useState(() => initialForm(request));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canEdit = editableStatuses.has(request.quoteStatus);

  const preview = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => {
      const quantity = Number(item.agreedQuantity);
      const unitPrice = Number(item.agreedUnitPrice);
      return sum + (Number.isFinite(quantity * unitPrice) ? quantity * unitPrice : 0);
    }, 0);
    const finalTotal =
      subtotal +
      Number(form.shippingCost || 0) +
      Number(form.taxAmount || 0) -
      Number(form.discountAmount || 0);
    return {
      subtotal: subtotal.toFixed(2),
      finalTotal: Number.isFinite(finalTotal) ? finalTotal.toFixed(2) : "0.00",
    };
  }, [form]);

  const updateItem = (itemId, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.itemId === itemId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.quoteValidUntil) {
      setError("Choose a quote valid-until date.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        items: form.items.map((item) => ({
          itemId: item.itemId,
          agreedQuantity: Number(item.agreedQuantity),
          agreedUnitPrice: item.agreedUnitPrice,
        })),
        shippingCost: form.shippingCost,
        discountAmount: form.discountAmount,
        taxAmount: form.taxAmount,
        quoteValidUntil: form.quoteValidUntil,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequestSection
      title="Quote / agreed pricing"
      description="Save prepares a draft. Send it through the quote-status workflow after review."
    >
      {!canEdit && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This quote cannot be edited in its current status. Use the supported quote workflow.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          {form.items.map((item) => (
            <Box key={item.itemId} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
              <Typography fontWeight={900}>{item.nameEn}</Typography>
              <Typography dir="rtl" variant="body2" sx={{ mb: 1.5 }}>{item.nameAr}</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                <TextField
                  label="Agreed quantity"
                  type="number"
                  inputProps={{ min: 1, max: 1000000, step: 1 }}
                  value={item.agreedQuantity}
                  disabled={!canEdit}
                  onChange={(event) => updateItem(item.itemId, "agreedQuantity", event.target.value)}
                  required
                />
                <TextField
                  label="Agreed unit price"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  value={item.agreedUnitPrice}
                  disabled={!canEdit}
                  onChange={(event) => updateItem(item.itemId, "agreedUnitPrice", event.target.value)}
                  required
                />
              </Box>
            </Box>
          ))}
          <Divider />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 1.5 }}>
            <TextField label="Shipping cost" type="number" inputProps={{ min: 0, step: "0.01" }} value={form.shippingCost} disabled={!canEdit} onChange={(event) => setForm({ ...form, shippingCost: event.target.value })} required />
            <TextField label="Discount" type="number" inputProps={{ min: 0, step: "0.01" }} value={form.discountAmount} disabled={!canEdit} onChange={(event) => setForm({ ...form, discountAmount: event.target.value })} required />
            <TextField label="Tax" type="number" inputProps={{ min: 0, step: "0.01" }} value={form.taxAmount} disabled={!canEdit} onChange={(event) => setForm({ ...form, taxAmount: event.target.value })} required />
            <TextField label="Valid until" type="date" InputLabelProps={{ shrink: true }} value={form.quoteValidUntil} disabled={!canEdit} onChange={(event) => setForm({ ...form, quoteValidUntil: event.target.value })} required />
          </Box>
          <Alert severity="warning">
            Preview only: subtotal {formatMoney(preview.subtotal, request.quote.currency)}; final total {formatMoney(preview.finalTotal, request.quote.currency)}. The backend response is authoritative.
          </Alert>
          <Box>
            <Button type="submit" variant="contained" startIcon={<PriceCheckOutlinedIcon />} disabled={!canEdit || saving}>
              {saving ? "Saving quote…" : "Save draft quote"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </RequestSection>
  );
}
