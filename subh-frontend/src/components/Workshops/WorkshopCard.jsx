import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { formatWorkshopDate, formatWorkshopMoney, formatWorkshopNumber, getWorkshopCopy, workshopStatusLabel } from "../../Utils/workshopI18n.js";

export default function WorkshopCard({ workshop, language }) {
  const t = getWorkshopCopy(language);
  return <Card sx={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
    <Box sx={{ aspectRatio:"16 / 9", bgcolor:"grey.100" }}>{workshop.imageUrl && <Box component="img" src={workshop.imageUrl} alt={workshop.title} loading="lazy" decoding="async" sx={{ width:"100%", height:"100%", objectFit:"cover" }} />}</Box>
    <CardContent sx={{ display:"flex", flexDirection:"column", gap:1.5, flexGrow:1 }}>
      <Stack direction="row" gap={1} flexWrap="wrap"><Chip size="small" label={workshop.category?.name || t.category} /><Chip size="small" color="info" label={workshopStatusLabel(workshop.mode, language)} />{workshop.nextSession && <Chip size="small" color={workshop.nextSession.full ? "error" : "success"} label={workshop.nextSession.full ? t.full : `${formatWorkshopNumber(workshop.nextSession.remainingSeats, language)} ${t.seatsRemaining}`} />}</Stack>
      <Typography variant="h6" component="h2" fontWeight={750}>{workshop.title}</Typography>
      <Typography color="text.secondary" sx={{ display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{workshop.description}</Typography>
      <Typography variant="body2">{t.presenter}: {workshop.presenter?.name}</Typography>
      <Typography variant="body2">{t.price}: {formatWorkshopMoney(workshop.nextSession?.price ?? workshop.price, workshop.currencyCode, language)}</Typography>
      {workshop.nextSession && <Typography variant="body2">{formatWorkshopDate(workshop.nextSession.startsAt, language)}</Typography>}
      <Box sx={{ mt:"auto", pt:1 }}><Button component={Link} to={`/workshops/${workshop.id}`} variant="contained" fullWidth>{t.view}</Button></Box>
    </CardContent>
  </Card>;
}
