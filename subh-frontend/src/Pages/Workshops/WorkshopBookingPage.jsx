import { Alert, Box, Button, CircularProgress, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { authContext } from "../../Context/authContextValue.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { createWorkshopBooking, getPublicWorkshop } from "../../Services/workshopService.js";
import { formatWorkshopDate, formatWorkshopMoney, getWorkshopCopy } from "../../Utils/workshopI18n.js";
import { trackEvent } from "../../Services/analyticsService.js";

const fields = ["fullName", "email", "phone", "age", "addressLine1", "addressLine2", "city", "state", "postalCode", "country"];

export default function WorkshopBookingPage() {
  const { workshopId, sessionId } = useParams();
  const { language } = useLanguage();
  const { user } = useContext(authContext);
  const t = getWorkshopCopy(language);
  const [workshop, setWorkshop] = useState(null);
  const [form, setForm] = useState({ fullName: user?.fullName || "", email: user?.email || "", phone: user?.phoneNumber || "", age: "", gender: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "" });
  const [state, setState] = useState({ loading: true, submitting: false, error: "", booking: null });

  useEffect(() => {
    void trackEvent("workshop_booking_started", {
      locale: language,
      entityType: "workshop_session",
      entityId: sessionId,
      dedupeKey: `workshop-booking-started:${sessionId}`,
    });
  }, [language, sessionId]);

  useEffect(() => {
    const controller = new AbortController();
    getPublicWorkshop(workshopId, language, { signal: controller.signal })
      .then((value) => { setWorkshop(value); setState((old) => ({ ...old, loading: false })); })
      .catch((error) => { if (!controller.signal.aborted) setState((old) => ({ ...old, loading: false, error: error.message })); });
    return () => controller.abort();
  }, [language, workshopId]);

  const session = workshop?.sessions.find((item) => String(item.id) === String(sessionId));
  const submit = async (event) => {
    event.preventDefault();
    setState((old) => ({ ...old, submitting: true, error: "" }));
    try {
      const payload = { ...form, age: Number(form.age) };
      const booking = await createWorkshopBooking(sessionId, payload, language);
      void trackEvent("workshop_booking_submitted", { locale: language, entityType: "workshop_booking", entityId: booking.id });
      setState((old) => ({ ...old, submitting: false, booking }));
    } catch (error) {
      setState((old) => ({ ...old, submitting: false, error: error.message }));
    }
  };

  if (state.loading) return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress aria-label={t.loading} /></Box>;
  if (state.error && !workshop) return <Container sx={{ py: 5 }}><Alert severity="error">{state.error}</Alert></Container>;
  if (!session) return <Container sx={{ py: 5 }}><Alert severity="warning">{t.full}</Alert></Container>;
  if (state.booking) return (
    <Container maxWidth="sm" dir={language === "ar" ? "rtl" : "ltr"} sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}><Stack spacing={2} alignItems="center">
        <Typography variant="h3">{t.bookingSuccess}</Typography><Typography>{state.booking.referenceNumber}</Typography>
        <Typography>{state.booking.workshopTitle} · {formatWorkshopDate(state.booking.startsAt, language)}</Typography>
        <Typography>{formatWorkshopMoney(state.booking.price, state.booking.currencyCode, language)}</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button component={Link} to={`/my-workshops/${state.booking.id}`} variant="contained">{t.viewBooking}</Button><Button component={Link} to="/my-workshops">{t.myBookings}</Button></Stack>
      </Stack></Paper>
    </Container>
  );
  return (
    <Container maxWidth="md" dir={language === "ar" ? "rtl" : "ltr"} sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={3}><Box><Typography variant="h3" component="h1">{t.booking}</Typography><Typography>{workshop.title}</Typography><Typography color="text.secondary">{formatWorkshopDate(session.startsAt, language)} · {formatWorkshopMoney(session.price, session.currencyCode, language)}</Typography></Box>
        <Alert severity="info">{t.paymentNotice}</Alert>{state.error && <Alert severity="error">{state.error}</Alert>}
        <Paper component="form" onSubmit={submit} sx={{ p: { xs: 2, md: 3 } }}><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 2 }}>
          {fields.map((field) => <TextField key={field} required={!['addressLine2'].includes(field)} type={field === "age" ? "number" : field === "email" ? "email" : "text"} label={({ fullName: language === "ar" ? "الاسم الكامل" : "Full name", email: language === "ar" ? "البريد الإلكتروني" : "Email", phone: language === "ar" ? "الهاتف" : "Phone", age: language === "ar" ? "العمر" : "Age", addressLine1: language === "ar" ? "العنوان" : "Address line 1", addressLine2: language === "ar" ? "العنوان الإضافي (اختياري)" : "Address line 2 (optional)", city: language === "ar" ? "المدينة" : "City", state: language === "ar" ? "المحافظة / الولاية" : "State", postalCode: language === "ar" ? "الرمز البريدي" : "Postal code", country: language === "ar" ? "الدولة" : "Country" })[field]} value={form[field]} onChange={(event) => setForm((old) => ({ ...old, [field]: event.target.value }))} inputProps={field === "age" ? { min: 0, max: 120 } : undefined} />)}
          <TextField select required label={language === "ar" ? "الجنس" : "Gender"} value={form.gender} onChange={(event) => setForm((old) => ({ ...old, gender: event.target.value }))}><MenuItem value="male">{t.male}</MenuItem><MenuItem value="female">{t.female}</MenuItem></TextField>
        </Box><Button type="submit" variant="contained" disabled={state.submitting || session.full} sx={{ mt: 3 }}>{state.submitting ? (language === "ar" ? "جارٍ الإرسال…" : "Submitting…") : t.submit}</Button></Paper>
      </Stack>
    </Container>
  );
}
