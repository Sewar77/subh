import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link } from "react-router-dom";
import {
  formatRequestDate,
  formatRequestMoney,
  formatRequestNumber,
  getBookRequestCopy,
} from "../../Utils/bookRequestI18n.js";
import CustomerRequestStatusChip from "./CustomerRequestStatusChip.jsx";

const Statuses = ({ request, language, t }) => (
  <Stack spacing={0.75} alignItems="flex-start">
    {[
      [t.requestStatus, request.requestStatus],
      [t.contactStatus, request.contactStatus],
      [t.paymentStatus, request.paymentStatus],
      [t.fulfillmentStatus, request.fulfillmentStatus],
      [t.quoteStatus, request.quoteStatus],
    ].map(([label, value]) => (
      <Stack key={label} direction="row" spacing={0.75} alignItems="center">
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>{label}</Typography>
        <CustomerRequestStatusChip value={value} language={language} />
      </Stack>
    ))}
  </Stack>
);

export default function MyRequestsList({ requests, language }) {
  const t = getBookRequestCopy(language);
  return (
    <>
      <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
        <Table aria-label={t.myRequestsTitle} size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t.reference}</TableCell>
              <TableCell>{t.date}</TableCell>
              <TableCell>{t.itemCount}</TableCell>
              <TableCell>{t.totalQuantity}</TableCell>
              <TableCell>{t.estimatedTotal}</TableCell>
              <TableCell>{t.statuses}</TableCell>
              <TableCell>{t.action}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell><Typography fontWeight={800}>{request.referenceNumber}</Typography></TableCell>
                <TableCell>{formatRequestDate(request.createdAt, language)}</TableCell>
                <TableCell>{formatRequestNumber(request.itemCount, language)}</TableCell>
                <TableCell>{formatRequestNumber(request.totalQuantity, language)}</TableCell>
                <TableCell>{formatRequestMoney(request.estimatedTotal, request.currency, language)}</TableCell>
                <TableCell sx={{ minWidth: 230 }}><Statuses request={request} language={language} t={t} /></TableCell>
                <TableCell>
                  <Button component={Link} to={`/my-requests/${request.id}`} variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />} aria-label={`${t.view}: ${request.referenceNumber}`}>
                    {t.view}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
        {requests.map((request) => (
          <Card key={request.id} variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">{t.reference}</Typography>
              <Typography variant="h6" fontWeight={900}>{request.referenceNumber}</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1, my: 2 }}>
                <Value label={t.date} value={formatRequestDate(request.createdAt, language)} />
                <Value label={t.itemCount} value={formatRequestNumber(request.itemCount, language)} />
                <Value label={t.totalQuantity} value={formatRequestNumber(request.totalQuantity, language)} />
                <Value label={t.estimatedTotal} value={formatRequestMoney(request.estimatedTotal, request.currency, language)} />
              </Box>
              <Statuses request={request} language={language} t={t} />
              <Button component={Link} to={`/my-requests/${request.id}`} fullWidth variant="contained" startIcon={<VisibilityOutlinedIcon />} sx={{ mt: 2 }}>
                {t.viewRequest}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}

function Value({ label, value }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography fontWeight={700}>{value}</Typography></Box>;
}
