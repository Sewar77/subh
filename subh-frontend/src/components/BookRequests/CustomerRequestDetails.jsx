import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import {
  formatRequestDate,
  formatRequestMoney,
  formatRequestNumber,
  getBookRequestCopy,
} from "../../Utils/bookRequestI18n.js";
import BookRequestProgress from "./BookRequestProgress.jsx";
import CustomerRequestSection from "./CustomerRequestSection.jsx";
import CustomerRequestStatusChip from "./CustomerRequestStatusChip.jsx";

const DetailGrid = ({ children }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
    {children}
  </Box>
);

const Detail = ({ label, value }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
    <Typography sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{value ?? "—"}</Typography>
  </Box>
);

export default function CustomerRequestDetails({ request, language }) {
  const t = getBookRequestCopy(language);
  const statusPairs = [
    [t.requestStatus, request.requestStatus],
    [t.contactStatus, request.contactStatus],
    [t.paymentStatus, request.paymentStatus],
    [t.fulfillmentStatus, request.fulfillmentStatus],
    [t.quoteStatus, request.quoteStatus],
  ];

  return (
    <Stack spacing={2}>
      <CustomerRequestSection title={t.overview}>
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
          {statusPairs.map(([label, value]) => (
            <Stack key={label} direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <CustomerRequestStatusChip value={value} language={language} />
            </Stack>
          ))}
        </Stack>
        <DetailGrid>
          <Detail label={t.referenceNumber} value={request.referenceNumber} />
          <Detail label={t.created} value={formatRequestDate(request.createdAt, language, true)} />
          <Detail label={t.updated} value={formatRequestDate(request.updatedAt, language, true)} />
          <Detail label={t.estimatedSubtotal} value={formatRequestMoney(request.estimates.subtotal, request.currency, language)} />
          <Detail label={t.estimatedShipping} value={formatRequestMoney(request.estimates.shippingCost, request.currency, language)} />
          <Detail label={t.estimatedTotal} value={formatRequestMoney(request.estimates.total, request.currency, language)} />
        </DetailGrid>
      </CustomerRequestSection>

      <CustomerRequestSection title={t.progress}>
        <BookRequestProgress request={request} language={language} />
      </CustomerRequestSection>

      <CustomerRequestSection title={t.requestedBooks}>
        <Stack spacing={2} divider={<Divider flexItem />}>
          {request.items.map((item) => (
            <Box key={item.id}>
              <Typography variant="h6" fontWeight={900}>{item.name}</Typography>
              <DetailGrid>
                <Detail label={t.isbn} value={item.isbn} />
                <Detail label={t.quantity} value={formatRequestNumber(item.quantity, language)} />
                <Detail label={t.catalogUnitPrice} value={formatRequestMoney(item.unitPrice, request.currency, language)} />
                <Detail label={t.unitShipping} value={formatRequestMoney(item.unitShippingCost, request.currency, language)} />
                <Detail label={t.lineSubtotal} value={formatRequestMoney(item.estimatedLineSubtotal, request.currency, language)} />
                <Detail label={t.lineShipping} value={formatRequestMoney(item.estimatedLineShipping, request.currency, language)} />
                {item.agreedQuantity !== undefined && <Detail label={t.agreedQuantity} value={formatRequestNumber(item.agreedQuantity, language)} />}
                {item.agreedUnitPrice !== undefined && <Detail label={t.agreedUnitPrice} value={formatRequestMoney(item.agreedUnitPrice, request.currency, language)} />}
                {item.agreedLineSubtotal !== undefined && <Detail label={t.agreedLineSubtotal} value={formatRequestMoney(item.agreedLineSubtotal, request.currency, language)} />}
              </DetailGrid>
            </Box>
          ))}
        </Stack>
      </CustomerRequestSection>

      <CustomerRequestSection title={t.shippingAddress}>
        <DetailGrid>
          <Detail label={t.shippingRecipient} value={request.shipping.recipient} />
          <Detail label={t.company} value={request.shipping.company} />
          <Detail label={t.phone} value={request.shipping.phone} />
          <Detail label={t.addressLine1} value={request.shipping.addressLine1} />
          <Detail label={t.addressLine2} value={request.shipping.addressLine2} />
          <Detail label={t.city} value={request.shipping.city} />
          <Detail label={t.state} value={request.shipping.state} />
          <Detail label={t.postalCode} value={request.shipping.postalCode} />
          <Detail label={t.country} value={request.shipping.country} />
          <Detail label={t.shippingNotes} value={request.shipping.notes} />
        </DetailGrid>
      </CustomerRequestSection>

      <CustomerRequestSection title={t.notes}>
        <Stack spacing={2}>
          <Detail label={t.customerNote} value={request.customerNote || t.noNote} />
          {request.customerVisibleAdminNote && (
            <Alert severity="info"><Typography fontWeight={800}>{t.customerVisibleNote}</Typography>{request.customerVisibleAdminNote}</Alert>
          )}
        </Stack>
      </CustomerRequestSection>

      {request.quote && (
        <CustomerRequestSection title={t.quote}>
          <DetailGrid>
            <Detail label={t.agreedSubtotal} value={formatRequestMoney(request.quote.agreedSubtotal, request.currency, language)} />
            <Detail label={t.shipping} value={formatRequestMoney(request.quote.shippingCost, request.currency, language)} />
            <Detail label={t.discount} value={formatRequestMoney(request.quote.discountAmount, request.currency, language)} />
            <Detail label={t.tax} value={formatRequestMoney(request.quote.taxAmount, request.currency, language)} />
            <Detail label={t.finalTotal} value={formatRequestMoney(request.quote.finalTotal, request.currency, language)} />
            <Detail label={t.quoteValidUntil} value={formatRequestDate(request.quote.validUntil, language)} />
          </DetailGrid>
        </CustomerRequestSection>
      )}
    </Stack>
  );
}
