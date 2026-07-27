import { Alert, Collapse, IconButton, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

export default function AdminInstructions({ title = "How to use this page", children }) {
  const [open, setOpen] = useState(true);
  return <Alert severity="info" icon={<InfoOutlinedIcon />} action={<IconButton aria-label={open ? "Collapse instructions" : "Expand instructions"} onClick={() => setOpen((value) => !value)}>{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>} sx={{ mb: 2, alignItems: "flex-start" }}><Typography fontWeight={800}>{title}</Typography><Collapse in={open}><Stack component="div" spacing={0.5} sx={{ mt: 0.5 }}><Typography variant="body2">{children}</Typography></Stack></Collapse></Alert>;
}
