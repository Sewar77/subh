import { Alert, Box, Button, Container, LinearProgress, Pagination, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { listMyWorkshopBookings } from "../../Services/workshopService.js";
import { formatWorkshopDate, formatWorkshopMoney, getWorkshopCopy } from "../../Utils/workshopI18n.js";
import WorkshopStatusChip from "../../components/Workshops/WorkshopStatusChip.jsx";

export default function MyWorkshopBookingsPage() {
  const { language } = useLanguage(); const t = getWorkshopCopy(language);
  const [params, setParams] = useSearchParams(); const page = Math.max(1, Number(params.get("page")) || 1);
  const [state, setState] = useState({ loading: true, error: "", bookings: [], pagination: null });
  useEffect(() => { const controller = new AbortController(); listMyWorkshopBookings({ lang: language, page, limit: 20 }, { signal: controller.signal }).then((data) => setState({ loading: false, error: "", ...data })).catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error: error.message, bookings: [], pagination: null }); }); return () => controller.abort(); }, [language, page]);
  return <Container maxWidth="lg" dir={language === "ar" ? "rtl" : "ltr"} sx={{ py: 5 }}><Stack spacing={3}><Box><Typography variant="h3" component="h1">{t.myBookings}</Typography><Button component={Link} to="/workshops">{t.back}</Button></Box>{state.loading && <LinearProgress aria-label={t.loading} />}{state.error && <Alert severity="error">{state.error}</Alert>}{!state.loading && !state.bookings.length && <Paper sx={{ p: 4 }}><Typography>{t.noBookings}</Typography></Paper>}<Stack spacing={2}>{state.bookings.map((booking) => <Paper key={booking.id} variant="outlined" sx={{ p: 2 }}><Stack direction={{ xs: "column", md: "row" }} gap={2} justifyContent="space-between" alignItems={{ md: "center" }}><Box><Typography variant="h6">{booking.workshopTitle}</Typography><Typography color="text.secondary">{booking.referenceNumber} · {formatWorkshopDate(booking.startsAt, language)}</Typography><Typography>{formatWorkshopMoney(booking.price, booking.currencyCode, language)}</Typography></Box><Stack direction="row" flexWrap="wrap" gap={1}><WorkshopStatusChip value={booking.bookingStatus} language={language} /><WorkshopStatusChip value={booking.paymentStatus} language={language} /><Button component={Link} to={`/my-workshops/${booking.id}`} variant="outlined">{t.viewBooking}</Button></Stack></Stack></Paper>)}</Stack>{state.pagination?.totalPages > 1 && <Pagination sx={{ alignSelf: "center" }} page={page} count={state.pagination.totalPages} onChange={(_, next) => setParams({ page: String(next) })} />}</Stack></Container>;
}
