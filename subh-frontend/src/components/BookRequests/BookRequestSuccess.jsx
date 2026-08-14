import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link } from "react-router-dom";
import {
  formatRequestMoney,
  formatRequestNumber,
  getBookRequestCopy,
} from "../../Utils/bookRequestI18n.js";
import CustomerRequestStatusChip from "./CustomerRequestStatusChip.jsx";

export default function BookRequestSuccess({ request, language }) {
  const t = getBookRequestCopy(language);
  const totalQuantity = request.items.reduce((sum, item) => sum + Number(item.quantity), 0);

  return (
    <Paper sx={{ p: { xs: 2.5, md: 5 }, borderRadius: 4, textAlign: "center" }}>
      <CheckCircleOutlineRoundedIcon color="success" sx={{ fontSize: 64 }} aria-hidden="true" />
      <Typography component="h1" variant="h3" sx={{ mt: 1, fontWeight: 800 }}>{t.requestSuccess}</Typography>
      <Alert severity="info" sx={{ my: 3, textAlign: "start" }}>{t.contactNotice}</Alert>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }, gap: 2, textAlign: "start" }}>
        <Summary label={t.referenceNumber} value={request.referenceNumber} />
        <Summary label={t.totalQuantity} value={formatRequestNumber(totalQuantity, language)} />
        <Summary label={t.estimatedSubtotal} value={formatRequestMoney(request.estimates.subtotal, request.currency, language)} />
        <Summary label={t.shipping} value={formatRequestMoney(request.estimates.shippingCost, request.currency, language)} />
        <Summary label={t.estimatedTotal} value={formatRequestMoney(request.estimates.total, request.currency, language)} />
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 3 }}>
        <CustomerRequestStatusChip value={request.requestStatus || "pending"} language={language} />
        <Button component={Link} to={`/my-requests/${request.id}`} variant="contained" startIcon={<VisibilityOutlinedIcon />}>
          {t.viewRequest}
        </Button>
        <Button component={Link} to="/my-requests" variant="outlined">{t.myRequests}</Button>
        <Button component={Link} to="/books" variant="text" startIcon={<MenuBookRoundedIcon />}>{t.continueBrowsing}</Button>
      </Stack>
    </Paper>
  );
}

function Summary({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
      <Typography fontWeight={800} sx={{ overflowWrap: "anywhere" }}>{value}</Typography>
    </Box>
  );
}
