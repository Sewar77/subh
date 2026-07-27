import { Tooltip, Typography } from "@mui/material";

export default function TruncatedText({ children, lines = 2, dir }) {
  const value = children || "—";
  return <Tooltip title={value === "—" ? "" : value}><Typography dir={dir} sx={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden", maxWidth: 220 }}>{value}</Typography></Tooltip>;
}
