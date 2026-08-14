import { Chip } from "@mui/material";
import { humanizeStatus, statusColor } from "./bookRequestUi.js";

export default function RequestStatusChip({ value, size = "small" }) {
  return (
    <Chip
      label={humanizeStatus(value)}
      color={statusColor(value)}
      size={size}
      variant={statusColor(value) === "default" ? "outlined" : "filled"}
    />
  );
}
