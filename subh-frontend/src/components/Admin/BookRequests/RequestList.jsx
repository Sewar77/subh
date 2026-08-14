import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RequestStatusChip from "./RequestStatusChip.jsx";
import { formatDate, formatMoney, humanizeStatus } from "./bookRequestUi.js";

const StatusStack = ({ request }) => (
  <Stack spacing={0.75} alignItems="flex-start">
    {[
      ["Request", request.requestStatus],
      ["Contact", request.contactStatus],
      ["Payment", request.paymentStatus],
      ["Fulfillment", request.fulfillmentStatus],
      ["Quote", request.quoteStatus],
    ].map(([label, value]) => (
      <Stack key={label} direction="row" spacing={0.75} alignItems="center">
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 68 }}>
          {label}
        </Typography>
        <RequestStatusChip value={value} />
      </Stack>
    ))}
  </Stack>
);

const Customer = ({ request }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography fontWeight={800} noWrap title={request.customer.fullName}>
      {request.customer.fullName}
    </Typography>
    {request.customer.companyName && (
      <Typography variant="body2" color="text.secondary" noWrap title={request.customer.companyName}>
        {request.customer.companyName}
      </Typography>
    )}
    <Chip label={humanizeStatus(request.customer.userType)} size="small" variant="outlined" sx={{ mt: 0.75 }} />
  </Box>
);

export default function RequestList({ requests, startIndex, onView }) {
  return (
    <>
      <TableContainer sx={{ display: { xs: "none", md: "block" }, maxWidth: "100%" }}>
        <Table size="small" aria-label="Administrator Book Requests">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Customer / company</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Totals</TableCell>
              <TableCell>Workflow</TableCell>
              <TableCell>Assignment / follow-up</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request, index) => (
              <TableRow key={request.id} hover>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>
                  <Typography fontWeight={800} sx={{ whiteSpace: "nowrap" }}>
                    {request.referenceNumber}
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 190, maxWidth: 260 }}>
                  <Customer request={request} />
                </TableCell>
                <TableCell>{request.totalQuantity}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2">Estimate: {formatMoney(request.estimatedTotal, request.currency)}</Typography>
                  <Typography variant="body2" fontWeight={700}>Final: {formatMoney(request.finalTotal, request.currency)}</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 230 }}><StatusStack request={request} /></TableCell>
                <TableCell sx={{ minWidth: 180 }}>
                  <Typography variant="body2">{request.assignedAdmin?.name || "Unassigned"}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Follow-up: {formatDate(request.nextFollowUpAt, true)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(request.createdAt, true)}</TableCell>
                <TableCell>
                  <Tooltip title="View request details">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => onView(request.id)}
                      aria-label={`View ${request.referenceNumber}`}
                    >
                      View
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
        {requests.map((request, index) => (
          <Card key={request.id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="caption">#{startIndex + index + 1}</Typography>
                  <Typography fontWeight={900}>{request.referenceNumber}</Typography>
                </Box>
                <RequestStatusChip value={request.requestStatus} />
              </Stack>
              <Box sx={{ my: 2 }}><Customer request={request} /></Box>
              <Typography variant="body2">Total quantity: {request.totalQuantity}</Typography>
              <Typography variant="body2">Estimated: {formatMoney(request.estimatedTotal, request.currency)}</Typography>
              <Typography variant="body2">Final: {formatMoney(request.finalTotal, request.currency)}</Typography>
              <Box sx={{ my: 2 }}><StatusStack request={request} /></Box>
              <Typography variant="body2">Assigned: {request.assignedAdmin?.name || "Unassigned"}</Typography>
              <Typography variant="body2">Follow-up: {formatDate(request.nextFollowUpAt, true)}</Typography>
              <Typography variant="body2">Created: {formatDate(request.createdAt, true)}</Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<VisibilityOutlinedIcon />}
                onClick={() => onView(request.id)}
                sx={{ mt: 2 }}
              >
                View request
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
