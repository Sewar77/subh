import { Alert, Button, CircularProgress, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getMyWorkshopBooking } from "../../Services/workshopService.js";
import { formatWorkshopDate, formatWorkshopMoney, getWorkshopCopy, workshopStatusLabel } from "../../Utils/workshopI18n.js";
import WorkshopStatusChip from "../../components/Workshops/WorkshopStatusChip.jsx";

export default function MyWorkshopBookingDetailPage() {
  const { id } = useParams(); const { language } = useLanguage(); const t = getWorkshopCopy(language);
  const [state, setState] = useState({ loading: true, error: "", booking: null });
  useEffect(() => { const controller = new AbortController(); getMyWorkshopBooking(id, language, { signal: controller.signal }).then((booking) => setState({ loading: false, error: "", booking })).catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error: error.message, booking: null }); }); return () => controller.abort(); }, [id, language]);
  if (state.loading) return <Container sx={{ py: 8, textAlign: "center" }}><CircularProgress /></Container>;
  if (state.error) return <Container sx={{ py: 5 }}><Alert severity="error">{state.error}</Alert></Container>;
  const b = state.booking;
  return <Container maxWidth="md" dir={language === "ar" ? "rtl" : "ltr"} sx={{ py: 5 }}><Stack spacing={3}><Button component={Link} to="/my-workshops" sx={{ alignSelf: "flex-start" }}>{t.myBookings}</Button><Paper sx={{ p: { xs: 2, md: 4 } }}><Stack spacing={2}><Typography variant="h3" component="h1">{b.workshopTitle}</Typography><Typography>{b.referenceNumber}</Typography><Stack direction="row" flexWrap="wrap" gap={1}><WorkshopStatusChip value={b.bookingStatus} language={language} /><WorkshopStatusChip value={b.paymentStatus} language={language} /><WorkshopStatusChip value={b.attendanceStatus} language={language} /></Stack><Divider /><Typography><strong>{t.presenter}:</strong> {b.presenterName}</Typography><Typography><strong>{t.category}:</strong> {b.categoryName}</Typography><Typography>{formatWorkshopDate(b.startsAt, language)} — {formatWorkshopDate(b.endsAt, language)}</Typography><Typography><strong>{t.price}:</strong> {formatWorkshopMoney(b.price, b.currencyCode, language)}</Typography>{b.registrationInstructions && <Typography sx={{ whiteSpace: "pre-line" }}>{b.registrationInstructions}</Typography>}<Divider /><Typography variant="h6">{t.attendee}</Typography><Typography>{b.attendee.fullName} · {b.attendee.email} · {b.attendee.phone}</Typography><Typography>{b.attendee.addressLine1}, {b.attendee.city}, {b.attendee.state}, {b.attendee.postalCode}, {b.attendee.country}</Typography>{b.meetingLink && <Alert severity="success"><a href={b.meetingLink} target="_blank" rel="noreferrer">{language === "ar" ? "رابط حضور الجلسة" : "Join the confirmed session"}</a></Alert>}{b.location && <Alert severity="success"><strong>{t.confirmedDetails}:</strong> {[b.location.venueName, b.location.address, b.location.instructions].filter(Boolean).join(" · ")}</Alert>}<Typography color="text.secondary">{t.status}: {workshopStatusLabel(b.bookingStatus, language)}</Typography></Stack></Paper></Stack></Container>;
}
