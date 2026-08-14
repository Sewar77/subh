import { Alert, Box, LinearProgress, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import {
  assignBookRequest,
  getAdminBookRequest,
  getAssignableAdmins,
  prepareBookRequestQuote,
  recordAdminBookRequestPayment,
  recordAdminBookRequestRefund,
  recordBookRequestContact,
  updateBookRequestNotes,
  updateBookRequestStatus,
  voidAdminBookRequestPayment,
} from "../../Services/adminBookRequestService.js";
import AdminInstructions from "../../components/Admin/AdminInstructions.jsx";
import ContactHistoryPanel from "../../components/Admin/BookRequests/ContactHistoryPanel.jsx";
import NotesPanel from "../../components/Admin/BookRequests/NotesPanel.jsx";
import PaymentPanel from "../../components/Admin/BookRequests/PaymentPanel.jsx";
import QuoteEditor from "../../components/Admin/BookRequests/QuoteEditor.jsx";
import RequestDetailsSummary from "../../components/Admin/BookRequests/RequestDetailsSummary.jsx";
import StatusHistoryPanel from "../../components/Admin/BookRequests/StatusHistoryPanel.jsx";
import WorkflowPanel from "../../components/Admin/BookRequests/WorkflowPanel.jsx";

function AdminBookRequestDetailContent({ id }) {
  const [request, setRequest] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [adminLoadError, setAdminLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getAdminBookRequest(id, { signal: controller.signal })
      .then(setRequest)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    let active = true;
    getAssignableAdmins()
      .then((users) => active && setAdmins(users))
      .catch((requestError) => active && setAdminLoadError(requestError.message));
    return () => {
      active = false;
    };
  }, []);

  const applyUpdate = async (operation, message) => {
    const updated = await operation();
    setRequest(updated);
    toast.success(message);
    return updated;
  };

  const applyPaymentUpdate = async (operation, message) => {
    const ledger = await operation();
    setRequest((current) => ({
      ...current,
      paymentStatus: ledger.paymentSummary.paymentStatus,
      paymentSummary: ledger.paymentSummary,
      payments: ledger.payments,
    }));
    try {
      const updated = await getAdminBookRequest(id);
      setRequest(updated);
    } catch {
      toast.error("Payment saved, but the complete request could not be refreshed. Reload before another action.");
    }
    toast.success(message);
    return ledger;
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        <LinearProgress aria-label="Loading Book Request details" />
        <Skeleton variant="rounded" height={180} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={320} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (error || !request) {
    return <Box sx={{ p: { xs: 1, md: 2 } }}><Alert severity="error">{error || "Book Request not found."}</Alert></Box>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, minWidth: 0 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Manage Book Request</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{request.referenceNumber}</Typography>
      <AdminInstructions>
        Review immutable customer and catalog snapshots before changing assignment,
        workflow, quote, notes, or the offline-payment ledger. Draft pricing and
        internal notes remain admin-only; payment status is calculated by the backend.
      </AdminInstructions>
      {adminLoadError && (
        <Alert severity="warning" sx={{ mb: 2 }}>{adminLoadError}</Alert>
      )}
      <Stack spacing={2}>
        <RequestDetailsSummary request={request} />
        <QuoteEditor
          request={request}
          onSave={(payload) => applyUpdate(
            () => prepareBookRequestQuote(id, payload),
            "Draft quote saved from backend calculations.",
          )}
        />
        <WorkflowPanel
          request={request}
          admins={admins}
          onAssign={(adminId) => applyUpdate(
            () => assignBookRequest(id, adminId),
            "Assignment updated.",
          )}
          onStatus={(statusType, status) => applyUpdate(
            () => updateBookRequestStatus(id, { statusType, status }),
            `${statusType} status updated.`,
          )}
        />
        <PaymentPanel
          request={request}
          onRecordPayment={(payload) => applyPaymentUpdate(
            () => recordAdminBookRequestPayment(id, payload),
            "Offline payment recorded and balances refreshed.",
          )}
          onRecordRefund={(payload) => applyPaymentUpdate(
            () => recordAdminBookRequestRefund(id, payload),
            "Offline refund recorded and balances refreshed.",
          )}
          onVoid={(paymentId, reason) => applyPaymentUpdate(
            () => voidAdminBookRequestPayment(id, paymentId, reason),
            "Ledger entry voided and balances refreshed.",
          )}
        />
        <NotesPanel
          notes={request.notes}
          onSave={(payload) => applyUpdate(
            () => updateBookRequestNotes(id, payload),
            "Notes saved.",
          )}
        />
        <ContactHistoryPanel
          history={request.contactHistory}
          onRecord={(payload) => applyUpdate(
            () => recordBookRequestContact(id, payload),
            "Contact recorded.",
          )}
        />
        <StatusHistoryPanel history={request.statusHistory} />
      </Stack>
    </Box>
  );
}

export default function AdminBookRequestDetailPage() {
  const { id } = useParams();

  return <AdminBookRequestDetailContent key={id} id={id} />;
}
