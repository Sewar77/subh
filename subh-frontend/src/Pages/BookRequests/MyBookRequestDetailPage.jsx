import { Alert, Box, Button, LinearProgress, Skeleton, Stack } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getMyBookRequest } from "../../Services/customerBookRequestService.js";
import { getBookRequestCopy } from "../../Utils/bookRequestI18n.js";
import CustomerRequestDetails from "../../components/BookRequests/CustomerRequestDetails.jsx";
import PublicPageHero from "../../components/Public/PublicPageHero.jsx";

function DetailContent({ id, language }) {
  const t = getBookRequestCopy(language);
  const [state, setState] = useState({ loading: true, request: null, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    getMyBookRequest(id, language, { signal: controller.signal })
      .then((request) => setState({ loading: false, request, error: "" }))
      .catch((requestError) => {
        if (!controller.signal.aborted) setState({ loading: false, request: null, error: requestError.status === 404 ? t.requestNotFound : t.detailsLoadError });
      });
    return () => controller.abort();
  }, [id, language, t.detailsLoadError, t.requestNotFound]);

  if (state.loading) {
    return <Stack spacing={2}><LinearProgress aria-label={t.loadingDetails} /><Skeleton variant="rounded" height={180} /><Skeleton variant="rounded" height={320} /></Stack>;
  }
  if (state.error || !state.request) return <Alert severity="error">{state.error || t.requestNotFound}</Alert>;

  return (
    <Stack spacing={3}>
      <PublicPageHero
        eyebrow={t.detailsEyebrow}
        title={state.request.referenceNumber}
        description={t.detailsDescription}
        icon={<ReceiptLongOutlinedIcon />}
        variant="detail"
        actions={
          <Button
            component={Link}
            to="/my-requests"
            variant="outlined"
            startIcon={language === "ar" ? <ArrowForwardRoundedIcon /> : <ArrowBackRoundedIcon />}
          >
            {t.backToRequests}
          </Button>
        }
      />
      <CustomerRequestDetails request={state.request} language={language} />
    </Stack>
  );
}

export default function MyBookRequestDetailPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  return <Box dir={language === "ar" ? "rtl" : "ltr"}><DetailContent key={`${id}:${language}`} id={id} language={language} /></Box>;
}
