import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAdminWorkshop, getAdminWorkshop, updateAdminWorkshop } from "../../Services/workshopService.js";
import AdminBackButton from "../../components/Admin/AdminBackButton.jsx";
import WorkshopForm from "../../components/Admin/Workshops/WorkshopForm.jsx";

export default function AdminWorkshopEditorPage() {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id);
  const [state, setState] = useState({ loading: editing, submitting: false, error: "", workshop: null });
  useEffect(() => { if (!editing) return; getAdminWorkshop(id).then((workshop) => setState((old) => ({ ...old, loading: false, workshop }))).catch((error) => setState((old) => ({ ...old, loading: false, error: error.message }))); }, [editing, id]);
  const submit = async (payload) => { setState((old) => ({ ...old, submitting: true, error: "" })); try { const workshop = editing ? await updateAdminWorkshop(id, payload) : await createAdminWorkshop(payload); navigate(`/admin/workshops/${workshop.id}`, { replace: true }); } catch (error) { setState((old) => ({ ...old, submitting: false, error: error.message })); } };
  return <Box sx={{ p: { xs: 1, md: 2 } }}><AdminBackButton fallback="/admin/workshops" /><Stack spacing={2}><Typography variant="h4">{editing ? "Edit Workshop" : "Create Workshop"}</Typography>{state.loading && <CircularProgress />}{state.error && <Alert severity="error">{state.error}</Alert>}{!state.loading && <WorkshopForm initialValue={state.workshop} onSubmit={submit} submitting={state.submitting} />}</Stack></Box>;
}
