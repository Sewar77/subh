import { Chip } from "@mui/material";
import { getRequestStatusLabel } from "../../Utils/bookRequestI18n.js";

const colorFor = (value) => {
  if (["completed", "delivered", "paid", "accepted", "resolved"].includes(value)) return "success";
  if (["cancelled", "rejected", "declined", "refunded"].includes(value)) return "error";
  if (["under_review", "follow_up_required", "sent", "shipped"].includes(value)) return "warning";
  if (["confirmed", "contacted", "ready", "preparing"].includes(value)) return "info";
  return "default";
};

export default function CustomerRequestStatusChip({ value, language }) {
  const color = colorFor(value);
  return (
    <Chip
      size="small"
      label={getRequestStatusLabel(value, language)}
      color={color}
      variant={color === "default" ? "outlined" : "filled"}
    />
  );
}
