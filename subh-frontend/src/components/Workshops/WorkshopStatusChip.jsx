import { Chip } from "@mui/material";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { workshopStatusLabel } from "../../Utils/workshopI18n.js";

const colors = { confirmed:"success",paid:"success",published:"success",attended:"success",awaiting_payment:"warning",pending:"warning",no_show:"error",rejected:"error",cancelled:"default",archived:"default",closed:"default",online:"info",offline:"secondary" };
export default function WorkshopStatusChip({ value, language: suppliedLanguage }) {
  const context = useLanguage();
  const language = suppliedLanguage || context.language;
  return <Chip size="small" label={workshopStatusLabel(value, language)} color={colors[value] || "default"} variant={value === "cancelled" || value === "archived" ? "outlined" : "filled"} />;
}

