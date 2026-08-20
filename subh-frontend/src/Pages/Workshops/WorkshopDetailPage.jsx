import { Alert, Box, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getPublicWorkshop } from "../../Services/workshopService.js";
import { trackEntityView } from "../../Services/analyticsService.js";
import WorkshopSessionCard from "../../components/Workshops/WorkshopSessionCard.jsx";
import { formatWorkshopMoney, formatWorkshopNumber, getWorkshopCopy, workshopStatusLabel } from "../../Utils/workshopI18n.js";

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = getWorkshopCopy(language);
  const [workshop, setWorkshop] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getPublicWorkshop(id, language, { signal: controller.signal })
      .then((value) => { setWorkshop(value); setError(""); })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      });
    return () => controller.abort();
  }, [id, language]);

  useEffect(() => {
    if (workshop?.id) void trackEntityView("workshop", workshop.id, language, `/workshops/${workshop.id}`);
  }, [language, workshop?.id]);

  if (error) return <Container sx={{ py: 5 }}><Alert severity="error">{error}</Alert></Container>;
  if (!workshop) return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" dir={language === "ar" ? "rtl" : "ltr"} sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Button component={Link} to="/workshops" sx={{ alignSelf: "flex-start" }}>{t.back}</Button>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(280px,.8fr) 1.2fr" }, gap: 4 }}>
          <Box sx={{ aspectRatio: "16 / 9", bgcolor: "grey.100", borderRadius: 3, overflow: "hidden" }}>
            {workshop.imageUrl && <Box component="img" src={workshop.imageUrl} alt={workshop.title} loading="eager" fetchPriority="high" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          </Box>
          <Stack spacing={2}>
            <Typography variant="h2" component="h1">{workshop.title}</Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{workshop.description}</Typography>
            <Typography><strong>{t.category}:</strong> {workshop.category?.name}</Typography>
            <Typography><strong>{t.presenter}:</strong> {workshop.presenter?.name}</Typography>
            <Typography>{workshop.presenter?.bio}</Typography>
            <Typography><strong>{t.duration}:</strong> {formatWorkshopNumber(workshop.durationMinutes, language)} {t.minutes}</Typography>
            <Typography><strong>{t.price}:</strong> {formatWorkshopMoney(workshop.price, workshop.currencyCode, language)}</Typography>
            <Typography><strong>{t.eligibility}:</strong> {workshopStatusLabel(workshop.genderEligibility, language)}{workshop.minAge != null ? ` · ${formatWorkshopNumber(workshop.minAge, language)}+` : ""}{workshop.maxAge != null ? ` · ≤ ${formatWorkshopNumber(workshop.maxAge, language)}` : ""}</Typography>
          </Stack>
        </Box>
        <Box component="section" aria-labelledby="available-workshop-sessions">
          <Typography id="available-workshop-sessions" variant="h4" sx={{ mb: 2.5 }}>{t.sessions}</Typography>
          {!workshop.sessions.length ? <Alert severity="info">{t.empty}</Alert> : (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 2, md: 2.5 } }}>
              {workshop.sessions.map((session) => <WorkshopSessionCard key={session.id} workshop={workshop} session={session} language={language} />)}
            </Box>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
