import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import RequestSection from "./RequestSection.jsx";
import RequestStatusChip from "./RequestStatusChip.jsx";
import { formatDate, formatMoney, humanizeStatus } from "./bookRequestUi.js";

const Detail = ({ label, value, children }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>
      {label}
    </Typography>
    {children || <Typography sx={{ overflowWrap: "anywhere" }}>{value ?? "—"}</Typography>}
  </Box>
);

const DetailGrid = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
      gap: 2,
    }}
  >
    {children}
  </Box>
);

export default function RequestDetailsSummary({ request }) {
  return (
    <Stack spacing={2}>
      <RequestSection title="Request overview" description={request.referenceNumber}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
          <RequestStatusChip value={request.requestStatus} />
          <RequestStatusChip value={request.contactStatus} />
          <RequestStatusChip value={request.paymentStatus} />
          <RequestStatusChip value={request.fulfillmentStatus} />
          <RequestStatusChip value={request.quoteStatus} />
        </Stack>
        <DetailGrid>
          <Detail label="Reference" value={request.referenceNumber} />
          <Detail label="Created" value={formatDate(request.createdAt, true)} />
          <Detail label="Last updated" value={formatDate(request.updatedAt, true)} />
          <Detail label="Last contacted" value={formatDate(request.lastContactedAt, true)} />
          <Detail label="Next follow-up" value={formatDate(request.nextFollowUpAt, true)} />
          <Detail label="Assigned administrator" value={request.assignedAdmin?.name || "Unassigned"} />
        </DetailGrid>
      </RequestSection>

      <RequestSection title="Customer / company information">
        <DetailGrid>
          <Detail label="Customer name" value={request.customer.fullName} />
          <Detail label="Customer type">
            <Chip label={humanizeStatus(request.customer.userType)} size="small" variant="outlined" />
          </Detail>
          <Detail label="Company" value={request.customer.companyName} />
          <Detail label="Account ID" value={request.customer.userId} />
        </DetailGrid>
      </RequestSection>

      <RequestSection title="Contact information">
        <DetailGrid>
          <Detail label="Email" value={request.customer.email} />
          <Detail label="Account phone" value={request.customer.phone} />
          <Detail label="Shipping phone" value={request.shipping.phone} />
          <Detail label="Shipping recipient" value={request.shipping.recipient} />
        </DetailGrid>
      </RequestSection>

      <RequestSection title="Shipping address">
        <DetailGrid>
          <Detail label="Company" value={request.shipping.company} />
          <Detail label="Address line 1" value={request.shipping.addressLine1} />
          <Detail label="Address line 2" value={request.shipping.addressLine2} />
          <Detail label="City" value={request.shipping.city} />
          <Detail label="State" value={request.shipping.state} />
          <Detail label="Postal code" value={request.shipping.postalCode} />
          <Detail label="Country" value={request.shipping.country} />
          <Detail label="Shipping notes" value={request.shipping.notes} />
          <Detail label="Carrier" value={request.shipping.carrier} />
          <Detail label="Tracking number" value={request.shipping.trackingNumber} />
          <Detail label="Shipped" value={formatDate(request.shipping.shippedAt, true)} />
          <Detail label="Delivered" value={formatDate(request.shipping.deliveredAt, true)} />
        </DetailGrid>
      </RequestSection>

      <RequestSection title="Requested books" description="Historical catalog and price snapshots captured when the customer submitted the request.">
        <Stack spacing={2}>
          {request.items.map((item) => (
            <Box key={item.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
              <Stack spacing={0.5}>
                <Typography fontWeight={900}>{item.nameEn}</Typography>
                <Typography dir="rtl" fontWeight={700}>{item.nameAr}</Typography>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <DetailGrid>
                <Detail label="ISBN" value={item.isbn} />
                <Detail label="Requested quantity" value={item.requestedQuantity} />
                <Detail label="Snapshot unit price" value={formatMoney(item.unitPriceSnapshot, request.quote.currency)} />
                <Detail label="Snapshot unit shipping" value={formatMoney(item.unitShippingCostSnapshot, request.quote.currency)} />
                <Detail label="Estimated subtotal" value={formatMoney(item.estimatedLineSubtotal, request.quote.currency)} />
                <Detail label="Estimated shipping" value={formatMoney(item.estimatedLineShipping, request.quote.currency)} />
                <Detail label="Agreed quantity" value={item.agreedQuantity} />
                <Detail label="Agreed unit price" value={formatMoney(item.agreedUnitPrice, request.quote.currency)} />
                <Detail label="Agreed line subtotal" value={formatMoney(item.agreedLineSubtotal, request.quote.currency)} />
              </DetailGrid>
            </Box>
          ))}
        </Stack>
      </RequestSection>

      <RequestSection title="Original estimates">
        <DetailGrid>
          <Detail label="Estimated subtotal" value={formatMoney(request.estimates.subtotal, request.quote.currency)} />
          <Detail label="Estimated shipping" value={formatMoney(request.estimates.shippingCost, request.quote.currency)} />
          <Detail label="Estimated total" value={formatMoney(request.estimates.total, request.quote.currency)} />
        </DetailGrid>
      </RequestSection>
    </Stack>
  );
}
