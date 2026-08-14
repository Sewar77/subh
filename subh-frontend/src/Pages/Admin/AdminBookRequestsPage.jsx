import {
  Alert,
  Box,
  LinearProgress,
  Paper,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAdminBookRequests,
  getAssignableAdmins,
} from "../../Services/adminBookRequestService.js";
import AdminInstructions from "../../components/Admin/AdminInstructions.jsx";
import RequestFilters from "../../components/Admin/BookRequests/RequestFilters.jsx";
import RequestList from "../../components/Admin/BookRequests/RequestList.jsx";

const EMPTY_FILTERS = {
  search: "",
  requestStatus: "",
  contactStatus: "",
  paymentStatus: "",
  fulfillmentStatus: "",
  quoteStatus: "",
  customerType: "",
  followUpDue: "",
  assignedAdminId: "",
};

const filtersFromQuery = (queryString) => {
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(
    Object.keys(EMPTY_FILTERS).map((field) => [field, params.get(field) || ""]),
  );
};

function AdminBookRequestsContent({
  adminLoadError,
  admins,
  searchParams,
  setSearchParams,
}) {
  const navigate = useNavigate();
  const queryString = searchParams.toString();
  const [filterDraft, setFilterDraft] = useState(() => filtersFromQuery(queryString));
  const [result, setResult] = useState({ requests: [], pagination: { page: 1, limit: 20, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getAdminBookRequests(
      Object.fromEntries(new URLSearchParams(queryString)),
      { signal: controller.signal },
    )
      .then(setResult)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [queryString]);

  const applyFilters = (event) => {
    event.preventDefault();
    const next = new URLSearchParams();
    for (const [field, value] of Object.entries(filterDraft)) {
      if (value !== "") next.set(field, value);
    }
    next.set("page", "1");
    next.set("limit", searchParams.get("limit") || "20");
    setSearchParams(next);
  };

  const changePage = (_, pageIndex) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(pageIndex + 1));
    setSearchParams(next);
  };

  const changeRowsPerPage = (event) => {
    const next = new URLSearchParams(searchParams);
    next.set("limit", event.target.value);
    next.set("page", "1");
    setSearchParams(next);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, minWidth: 0 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Book Requests</Typography>
      <AdminInstructions>
        Search and filter on the server, then open a request to manage assignment,
        workflow, quote preparation, notes, and customer contact. Payment status is
        read-only until the payment phase is implemented.
      </AdminInstructions>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
        <RequestFilters
          value={filterDraft}
          admins={admins}
          onChange={setFilterDraft}
          onSubmit={applyFilters}
          onReset={() => {
            setFilterDraft(EMPTY_FILTERS);
            setSearchParams({ page: "1", limit: "20" });
          }}
        />
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {adminLoadError && <Alert severity="warning" sx={{ mb: 2 }}>{adminLoadError}</Alert>}
      {loading && <LinearProgress aria-label="Loading Book Requests" sx={{ mb: 2 }} />}
      {!loading && !error && (
        result.requests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No Book Requests match these filters.</Typography>
            <Typography color="text.secondary">Adjust or clear the filters to try again.</Typography>
          </Paper>
        ) : (
          <Paper sx={{ maxWidth: "100%", overflow: "hidden" }}>
            <RequestList
              requests={result.requests}
              startIndex={(result.pagination.page - 1) * result.pagination.limit}
              onView={(id) => navigate(`/admin/requests/${id}`)}
            />
            <Stack alignItems="flex-end" sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <TablePagination
                component="div"
                count={result.pagination.total}
                page={Math.max(0, result.pagination.page - 1)}
                rowsPerPage={result.pagination.limit}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPageChange={changePage}
                onRowsPerPageChange={changeRowsPerPage}
              />
            </Stack>
          </Paper>
        )
      )}
    </Box>
  );
}

export default function AdminBookRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [admins, setAdmins] = useState([]);
  const [adminLoadError, setAdminLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getAssignableAdmins()
      .then((users) => active && setAdmins(users))
      .catch((requestError) => active && setAdminLoadError(requestError.message));
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminBookRequestsContent
      key={searchParams.toString()}
      adminLoadError={adminLoadError}
      admins={admins}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  );
}
