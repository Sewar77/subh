import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { Link } from "react-router-dom";
import { formatWorkshopDay, formatWorkshopMoney, formatWorkshopNumber, formatWorkshopTimeRange, getWorkshopCopy } from "../../Utils/workshopI18n.js";

const availability = (session, t) => {
  if (session.status && session.status !== "open") return { label: t.closed, color: "default", disabled: true };
  if (session.full || Number(session.remainingSeats) <= 0) return { label: t.fullShort, color: "error", disabled: true };
  const almostFullAt = Math.max(3, Math.ceil(Number(session.seatCapacity || 0) * 0.1));
  if (Number(session.remainingSeats) <= almostFullAt) return { label: t.almostFull, color: "warning", disabled: false };
  return { label: t.available, color: "success", disabled: false };
};

export default function WorkshopSessionCard({ workshop, session, language }) {
  const t = getWorkshopCopy(language);
  const state = availability(session, t);
  const location = workshop.mode === "online" ? t.online : session.generalLocation || t.offline;
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, transition: "transform 160ms ease, box-shadow 160ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}>
      <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}><CalendarMonthOutlinedIcon color="primary" fontSize="small" /><Typography fontWeight={850}>{formatWorkshopDay(session.startsAt, language, session.timezone)}</Typography></Stack>
          <Chip size="small" label={state.label} color={state.color} sx={{ flexShrink: 0, fontWeight: 750 }} />
        </Stack>
        <Detail icon={<ScheduleOutlinedIcon />} value={formatWorkshopTimeRange(session.startsAt, session.endsAt, language, session.timezone)} />
        <Detail icon={workshop.mode === "online" ? <PublicOutlinedIcon /> : <LocationOnOutlinedIcon />} value={location} />
        <Detail icon={<GroupsOutlinedIcon />} value={`${formatWorkshopNumber(session.remainingSeats, language)} ${t.seatsRemaining}`} />
        <Divider />
        <Box><Typography variant="caption" color="text.secondary">{t.price}</Typography><Typography variant="h6" fontWeight={850}>{formatWorkshopMoney(session.price, session.currencyCode, language)}</Typography></Box>
      </Stack>
      <Button component={Link} to={`/workshops/${workshop.id}/sessions/${session.id}/book`} variant="contained" disabled={state.disabled} fullWidth sx={{ mt: 2, minHeight: 42 }}>{state.disabled ? state.label : t.book}</Button>
    </Paper>
  );
}

function Detail({ icon, value }) {
  return <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0, color: "text.secondary" }}><Box sx={{ display: "flex", color: "primary.main", mt: "2px", "& svg": { fontSize: 19 } }}>{icon}</Box><Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{value}</Typography></Stack>;
}
