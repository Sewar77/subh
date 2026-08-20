import { Alert, Box, Chip, LinearProgress, MenuItem, Paper, Stack, Tab, Tabs, TablePagination, TextField, Typography } from "@mui/material";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import {
  getAnalyticsBookRequests,
  getAnalyticsCustomers,
  getAnalyticsOverview,
  getAnalyticsTraffic,
  getAnalyticsWorkshops,
} from "../../Services/adminAnalyticsService.js";
import { getAnalyticsCopy, formatAnalyticsDate, formatAnalyticsMoney, formatAnalyticsNumber, formatAnalyticsPercent } from "../../Utils/analyticsI18n.js";
import AdminInstructions from "../../components/Admin/AdminInstructions.jsx";
import AnalyticsBars from "../../components/Admin/Analytics/AnalyticsBars.jsx";
import AnalyticsDateRange from "../../components/Admin/Analytics/AnalyticsDateRange.jsx";
import AnalyticsMetricCard from "../../components/Admin/Analytics/AnalyticsMetricCard.jsx";
import AnalyticsTable from "../../components/Admin/Analytics/AnalyticsTable.jsx";
import AnalyticsTrendChart from "../../components/Admin/Analytics/AnalyticsTrendChart.jsx";
import { getRequestStatusLabel } from "../../Utils/bookRequestI18n.js";
import { workshopStatusLabel } from "../../Utils/workshopI18n.js";

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
const initialRange = { preset: "30d", dateFrom: monthAgo, dateTo: today, timezone: "Africa/Cairo" };

const metricGrid = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))", lg: "repeat(3,minmax(0,1fr))", xl: "repeat(6,minmax(0,1fr))" }, gap: 2 };
const panelGrid = { display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2,minmax(0,1fr))" }, gap: 2 };

const endpointByTab = {
  traffic: getAnalyticsTraffic,
  customers: getAnalyticsCustomers,
  bookRequests: getAnalyticsBookRequests,
  workshops: getAnalyticsWorkshops,
};

const selectedMoney = (rows = [], source) => rows.find((row) => !source || row.source === source) || { currencyCode: "USD", revenueCurrent: 0, revenuePrevious: 0, outstandingCurrent: 0 };

export default function AdminAnalyticsPage() {
  const { language } = useLanguage();
  const t = getAnalyticsCopy(language);
  const [draftRange, setDraftRange] = useState(initialRange);
  const [range, setRange] = useState(initialRange);
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panelLoading, setPanelLoading] = useState(false);
  const [error, setError] = useState("");
  const [segment, setSegment] = useState("all");
  const [customerPage, setCustomerPage] = useState(1);

  const params = useMemo(() => {
    const base = { preset: range.preset, timezone: range.timezone };
    return range.preset === "custom" ? { ...base, dateFrom: range.dateFrom, dateTo: range.dateTo } : base;
  }, [range]);
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const controller = new AbortController();
    getAnalyticsOverview(params, { signal: controller.signal })
      .then(setOverview)
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [params, paramsKey]);

  useEffect(() => {
    if (tab === "overview") return undefined;
    const controller = new AbortController();
    endpointByTab[tab]({ ...params, ...(tab === "customers" ? { segment, page: customerPage, limit: 20 } : {}) }, { signal: controller.signal })
      .then(setPanel)
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError.message); })
      .finally(() => { if (!controller.signal.aborted) setPanelLoading(false); });
    return () => controller.abort();
  }, [customerPage, params, paramsKey, segment, tab]);

  const requestMoney = selectedMoney(overview?.bookRequests?.moneyByCurrency, "book_request");
  const revenueMetric = overview?.financials?.revenueByCurrency?.[0] || { currencyCode: "USD", current: 0, previous: 0, difference: 0, percentageChange: 0 };

  return (
    <Box dir={language === "ar" ? "rtl" : "ltr"} sx={{ p: { xs: 1.5, md: 3 }, minWidth: 0 }}>
      <Stack spacing={2.5}>
        <Box><Typography variant="h4" component="h1" fontWeight={850}>{t.title}</Typography><Typography color="text.secondary">{t.intro}</Typography></Box>
        <AdminInstructions>{t.intro}</AdminInstructions>
        <Paper variant="outlined" sx={{ p: 2 }}><AnalyticsDateRange value={draftRange} onChange={setDraftRange} onApply={() => { setLoading(true); setPanelLoading(tab !== "overview"); setError(""); setRange(draftRange); setCustomerPage(1); }} copy={t} /></Paper>
        {error && <Alert severity="error">{error}</Alert>}
        {loading && <LinearProgress aria-label={t.loading} />}
        {overview && <Box sx={metricGrid}>
          <AnalyticsMetricCard label={t.visitors} value={overview.traffic.uniqueVisitors.current} comparison={overview.traffic.uniqueVisitors} language={language} icon={<VisibilityOutlinedIcon />} />
          <AnalyticsMetricCard label={t.bookRequests} value={overview.bookRequests.created.current} comparison={overview.bookRequests.created} language={language} icon={<MenuBookOutlinedIcon />} />
          <AnalyticsMetricCard label={t.purchasingCustomers} value={overview.bookRequests.purchasingCustomers.current} comparison={overview.bookRequests.purchasingCustomers} language={language} icon={<PersonOutlineOutlinedIcon />} />
          <AnalyticsMetricCard label={t.revenue} value={revenueMetric.current} comparison={revenueMetric} language={language} formatter={(value) => formatAnalyticsMoney(value, revenueMetric.currencyCode, language)} icon={<AttachMoneyOutlinedIcon />} />
          <AnalyticsMetricCard label={t.outstanding} value={requestMoney.outstandingCurrent} language={language} formatter={(value) => formatAnalyticsMoney(value, requestMoney.currencyCode, language)} icon={<AssessmentOutlinedIcon />} />
          <AnalyticsMetricCard label={t.workshopBookings} value={overview.workshops.bookings.current} comparison={overview.workshops.bookings} language={language} icon={<GroupsOutlinedIcon />} />
        </Box>}
        <Paper variant="outlined" sx={{ minWidth: 0 }}><Tabs value={tab} onChange={(_, value) => { setPanelLoading(value !== "overview"); setError(""); setTab(value); }} variant="scrollable" scrollButtons="auto" aria-label={t.title}><Tab value="overview" label={t.overview} /><Tab value="traffic" label={t.traffic} /><Tab value="customers" label={t.customers} /><Tab value="bookRequests" label={t.bookRequests} /><Tab value="workshops" label={t.workshops} /></Tabs></Paper>
        {panelLoading && <LinearProgress aria-label={t.loading} />}
        {!loading && tab === "overview" && overview && <OverviewPanel data={overview} t={t} language={language} />}
        {!panelLoading && tab === "traffic" && panel && <TrafficPanel data={panel} t={t} language={language} />}
        {!panelLoading && tab === "customers" && panel && <CustomersPanel data={panel} t={t} language={language} segment={segment} setSegment={(value) => { setPanelLoading(true); setSegment(value); setCustomerPage(1); }} page={customerPage} setPage={(value) => { setPanelLoading(true); setCustomerPage(value); }} />}
        {!panelLoading && tab === "bookRequests" && panel && <BookRequestsPanel data={panel} t={t} language={language} />}
        {!panelLoading && tab === "workshops" && panel && <WorkshopsPanel data={panel} t={t} language={language} />}
      </Stack>
    </Box>
  );
}

function OverviewPanel({ data, t, language }) {
  const cards = [
    [t.sessions, data.traffic.sessions.current], [t.pageViews, data.traffic.pageViews.current], [t.knownUsers, data.traffic.knownUsers.current], [t.newVisitors, data.traffic.newVisitors], [t.returningVisitors, data.traffic.returningVisitors],
    [t.totalAccounts, data.users.totalAccounts], [t.newAccounts, data.users.newAccounts.current], [t.individuals, data.users.individuals], [t.companies, data.users.companies], [t.activeAccounts, data.users.activeAccounts], [t.inactiveAccounts, data.users.inactiveAccounts],
  ];
  return <Box sx={metricGrid}>{cards.map(([label, value]) => <AnalyticsMetricCard key={label} label={label} value={value} language={language} />)}</Box>;
}

function TrafficPanel({ data, t, language }) {
  return <Stack spacing={2}><AnalyticsTrendChart rows={data.trend} language={language} title={t.trend} emptyLabel={t.empty} labels={{ visitors: t.visitors, sessions: t.sessions, pageViews: t.pageViews }} /><Box sx={panelGrid}><AnalyticsTable title={t.topPages} emptyLabel={t.empty} rows={data.topPages} columns={[{ key: "pagePath", label: t.page }, { key: "pageViews", label: t.pageViews, render: (row) => formatAnalyticsNumber(row.pageViews, language) }, { key: "visitors", label: t.visitors, render: (row) => formatAnalyticsNumber(row.visitors, language) }]} /><AnalyticsBars title={t.devices} rows={data.devices} language={language} emptyLabel={t.empty} /><AnalyticsBars title={t.languages} rows={data.languages} language={language} emptyLabel={t.empty} /><AnalyticsBars title={t.referrers} rows={data.referrers} language={language} emptyLabel={t.empty} /><AnalyticsTable title={t.acquisition} emptyLabel={t.empty} rows={data.campaigns} columns={[{ key: "source", label: t.source }, { key: "medium", label: t.medium }, { key: "campaign", label: t.campaign }, { key: "sessions", label: t.sessions, render: (row) => formatAnalyticsNumber(row.sessions, language) }]} /></Box></Stack>;
}

function CustomersPanel({ data, t, language, segment, setSegment, page, setPage }) {
  const summary = data.summary;
  return <Stack spacing={2}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}><Box sx={{ ...metricGrid, flex: 1 }}>{[[t.requestOnly, summary.requestOnly], [t.oneTime, summary.oneTime], [t.repeat, summary.repeat], [t.loyal, summary.loyal], [t.individuals, summary.individuals], [t.companies, summary.companies]].map(([label, value]) => <AnalyticsMetricCard key={label} label={label} value={value} language={language} />)}</Box><TextField select size="small" label={t.segment} value={segment} onChange={(event) => setSegment(event.target.value)} sx={{ minWidth: 210, alignSelf: "flex-start" }}><MenuItem value="all">{t.all}</MenuItem><MenuItem value="request_only">{t.requestOnly}</MenuItem><MenuItem value="one_time">{t.oneTime}</MenuItem><MenuItem value="repeat">{t.repeat}</MenuItem><MenuItem value="loyal">{t.loyal}</MenuItem><MenuItem value="high_value">{t.highValue}</MenuItem></TextField></Stack><AnalyticsTable title={t.customers} emptyLabel={t.empty} rows={data.customers} columns={[{ key: "fullName", label: t.customer, render: (row) => <Typography component={Link} to={`/admin/users/${row.id}`} color="primary.main" fontWeight={750}>{row.fullName}</Typography> }, { key: "userType", label: t.type, render: (row) => row.userType === "company" ? t.company : t.individual }, { key: "requestCount", label: t.requests }, { key: "purchaseCount", label: t.purchases }, { key: "totalPaid", label: t.totalPaid, render: (row) => formatAnalyticsMoney(row.totalPaid, "USD", language) }, { key: "lastRequestAt", label: t.lastRequest, render: (row) => formatAnalyticsDate(row.lastRequestAt, language) }]} />{data.pagination.total > data.pagination.limit && <TablePagination component="div" count={data.pagination.total} page={page - 1} rowsPerPage={data.pagination.limit} rowsPerPageOptions={[20]} onPageChange={(_, next) => setPage(next + 1)} />}</Stack>;
}

const funnelRows = (data, language, t) => data.funnel.map((row) => ({ ...row, label: t[row.stage] || row.stage, value: row.count, secondary: `${formatAnalyticsPercent(row.conversionFromPrevious, language)} · ${row.source === "analytics" ? t.analyticsSource : t.businessSource}` }));
const localizedName = (row, language) => language === "ar" ? row.nameAr : row.nameEn;

function BookRequestsPanel({ data, t, language }) {
  const summary = data.summary;
  const money = data.moneyByCurrency[0] || { currencyCode: "USD", revenue: 0, outstanding: 0 };
  const cards = [[t.requestsCreated, summary.requestsCreated], [t.totalQuantity, summary.totalQuantity], [t.confirmed, summary.confirmed], [t.completed, summary.completed], [t.cancelled, summary.cancelled], [t.rejected, summary.rejected]];
  return <Stack spacing={2}><Box sx={metricGrid}>{cards.map(([label, value]) => <AnalyticsMetricCard key={label} label={label} value={value} language={language} />)}<AnalyticsMetricCard label={t.revenue} value={money.revenue} language={language} formatter={(value) => formatAnalyticsMoney(value, money.currencyCode, language)} /><AnalyticsMetricCard label={t.outstanding} value={money.outstanding} language={language} formatter={(value) => formatAnalyticsMoney(value, money.currencyCode, language)} /></Box><Box sx={panelGrid}><AnalyticsBars title={t.funnel} rows={funnelRows(data, language, t)} language={language} emptyLabel={t.empty} /><AnalyticsBars title={t.statuses} rows={data.statuses.map((row) => ({ ...row, label: getRequestStatusLabel(row.label, language) }))} language={language} emptyLabel={t.empty} /><AnalyticsTable title={t.topBooks} emptyLabel={t.empty} rows={data.topBooks} columns={[{ key: "name", label: t.name, render: (row) => localizedName(row, language) }, { key: "requestedQuantity", label: t.quantity, render: (row) => formatAnalyticsNumber(row.requestedQuantity, language) }, { key: "requestCount", label: t.requestCount }]} /><AnalyticsTable title={t.topCategories} emptyLabel={t.empty} rows={data.topCategories} columns={[{ key: "name", label: t.name, render: (row) => localizedName(row, language) }, { key: "requestedQuantity", label: t.quantity }, { key: "requestCount", label: t.requestCount }]} /></Box></Stack>;
}

function WorkshopsPanel({ data, t, language }) {
  const summary = data.summary;
  const money = data.revenueByCurrency[0] || { currencyCode: "USD", revenue: 0 };
  const ageLabels = { under_18: t.under18, "18_24": t.age18To24, "25_34": t.age25To34, "35_44": t.age35To44, "45_plus": t.age45Plus };
  return <Stack spacing={2}><Box sx={metricGrid}>{[[t.publishedWorkshops, summary.publishedWorkshops], [t.availableSessions, summary.availableSessions], [t.bookings, summary.bookingsCreated], [t.confirmed, summary.confirmed], [t.awaitingPayment, summary.awaitingPayment], [t.attended, data.attendance.attended]].map(([label, value]) => <AnalyticsMetricCard key={label} label={label} value={value} language={language} />)}<AnalyticsMetricCard label={t.revenue} value={money.revenue} language={language} formatter={(value) => formatAnalyticsMoney(value, money.currencyCode, language)} /></Box><Box sx={panelGrid}><AnalyticsBars title={t.funnel} rows={funnelRows(data, language, t)} language={language} emptyLabel={t.empty} /><AnalyticsBars title={t.modes} rows={data.modes.map((row) => ({ label: workshopStatusLabel(row.label, language), value: row.bookings }))} language={language} emptyLabel={t.empty} /><Paper variant="outlined" sx={{ p: 2.5 }}><Typography variant="h6" fontWeight={800}>{t.reservedOccupancy}</Typography><Typography variant="h3">{formatAnalyticsPercent(data.occupancy.reservedRate, language)}</Typography><Typography color="text.secondary">{t.confirmedOccupancy}: {formatAnalyticsPercent(data.occupancy.confirmedRate, language)}</Typography></Paper><Paper variant="outlined" sx={{ p: 2.5 }}><Typography variant="h6" fontWeight={800}>{t.attendanceRate}</Typography><Typography variant="h3">{formatAnalyticsPercent(data.attendance.attendanceRate, language)}</Typography><Stack direction="row" gap={1} flexWrap="wrap"><Chip label={`${t.attended}: ${formatAnalyticsNumber(data.attendance.attended, language)}`} /><Chip label={`${t.noShow}: ${formatAnalyticsNumber(data.attendance.noShow, language)}`} /><Chip label={`${t.notMarked}: ${formatAnalyticsNumber(data.attendance.notMarked, language)}`} /></Stack></Paper><AnalyticsTable title={t.topWorkshops} emptyLabel={t.empty} rows={data.topWorkshops} columns={[{ key: "name", label: t.name, render: (row) => localizedName(row, language) }, { key: "bookings", label: t.bookings }, { key: "confirmed", label: t.confirmed }]} /><AnalyticsTable title={t.presenters} emptyLabel={t.empty} rows={data.presenters} columns={[{ key: "name", label: t.name, render: (row) => localizedName(row, language) }, { key: "bookings", label: t.bookings }, { key: "attended", label: t.attended }]} /><AnalyticsTable title={t.topCategories} emptyLabel={t.empty} rows={data.categories} columns={[{ key: "name", label: t.name, render: (row) => localizedName(row, language) }, { key: "bookings", label: t.bookings }, { key: "confirmed", label: t.confirmed }]} /><AnalyticsBars title={t.demographics} rows={data.demographics.map((row) => ({ label: `${ageLabels[row.ageBand] || row.ageBand} · ${workshopStatusLabel(row.gender, language)}`, value: row.value }))} language={language} emptyLabel={t.empty} /></Box></Stack>;
}
