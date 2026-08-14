import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getMyBookRequests } from "../../Services/customerBookRequestService.js";
import { formatRequestNumber, getBookRequestCopy } from "../../Utils/bookRequestI18n.js";
import MyRequestsList from "../../components/BookRequests/MyRequestsList.jsx";
import PublicPageHero from "../../components/Public/PublicPageHero.jsx";

function RequestsContent({ language, page, setSearchParams }) {
  const t = getBookRequestCopy(language);
  const [state, setState] = useState({ loading: true, requests: [], pagination: null, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    getMyBookRequests({ page, limit: 20, lang: language }, { signal: controller.signal })
      .then((response) => setState({ loading: false, requests: response.requests, pagination: response.pagination, error: "" }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ loading: false, requests: [], pagination: null, error: t.requestsLoadError });
      });
    return () => controller.abort();
  }, [language, page, t.requestsLoadError]);

  return (
    <Box dir={language === "ar" ? "rtl" : "ltr"}>
      <Stack spacing={3}>
        <PublicPageHero
          eyebrow={t.myRequestsEyebrow}
          title={t.myRequestsTitle}
          description={t.myRequestsDescription}
          icon={<ReceiptLongOutlinedIcon />}
          actions={<Button component={Link} to="/request-books" variant="contained" startIcon={<AddRoundedIcon />}>{t.startRequest}</Button>}
        />
        {state.loading && <LinearProgress aria-label={t.loadingRequests} />}
        {state.error && <Alert severity="error">{state.error}</Alert>}
        {!state.loading && !state.error && state.requests.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center" }}><Typography>{t.noRequests}</Typography></Paper>
        )}
        {!state.loading && !state.error && state.requests.length > 0 && (
          <Paper sx={{ overflow: "hidden" }}>
            <MyRequestsList requests={state.requests} language={language} />
          </Paper>
        )}
        {state.pagination?.totalPages > 1 && (
          <Pagination
            count={state.pagination.totalPages}
            page={state.pagination.page}
            onChange={(_, nextPage) => setSearchParams({ page: String(nextPage) })}
            color="primary"
            siblingCount={0}
            boundaryCount={1}
            aria-label={t.pagination}
            getItemAriaLabel={(type, itemPage) => `${t.pagination}: ${type}${itemPage ? ` ${formatRequestNumber(itemPage, language)}` : ""}`}
            sx={{ alignSelf: "center" }}
          />
        )}
      </Stack>
    </Box>
  );
}

export default function MyBookRequestsPage() {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  return <RequestsContent key={`${language}:${page}`} language={language} page={page} setSearchParams={setSearchParams} />;
}
