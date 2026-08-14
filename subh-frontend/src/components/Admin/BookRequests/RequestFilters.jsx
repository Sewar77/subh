import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { STATUS_OPTIONS, humanizeStatus } from "./bookRequestUi.js";

const statusFields = [
  ["requestStatus", "Request status", "request"],
  ["contactStatus", "Contact status", "contact"],
  ["paymentStatus", "Payment status", "payment"],
  ["fulfillmentStatus", "Fulfillment status", "fulfillment"],
  ["quoteStatus", "Quote status", "quote"],
];

export default function RequestFilters({
  value,
  admins,
  onChange,
  onSubmit,
  onReset,
}) {
  const update = (field) => (event) =>
    onChange({ ...value, [field]: event.target.value });

  return (
    <Box component="form" onSubmit={onSubmit} aria-label="Book Request filters">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <TextField
          label="Search requests"
          value={value.search}
          onChange={update("search")}
          placeholder="Reference, customer, email, phone, company"
          InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1 }} /> }}
          sx={{ gridColumn: { sm: "span 2" } }}
        />
        {statusFields.map(([field, label, type]) => (
          <TextField
            key={field}
            select
            label={label}
            value={value[field]}
            onChange={update(field)}
          >
            <MenuItem value="">All</MenuItem>
            {STATUS_OPTIONS[type].map((status) => (
              <MenuItem key={status} value={status}>
                {humanizeStatus(status)}
              </MenuItem>
            ))}
          </TextField>
        ))}
        <TextField
          select
          label="Customer type"
          value={value.customerType}
          onChange={update("customerType")}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="individual">Individual</MenuItem>
          <MenuItem value="company">Company</MenuItem>
        </TextField>
        <TextField
          select
          label="Follow-up"
          value={value.followUpDue}
          onChange={update("followUpDue")}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Due now</MenuItem>
          <MenuItem value="false">Not due</MenuItem>
        </TextField>
        <TextField
          select
          label="Assigned administrator"
          value={value.assignedAdminId}
          onChange={update("assignedAdminId")}
        >
          <MenuItem value="">All administrators</MenuItem>
          {admins.map((admin) => (
            <MenuItem key={admin.id} value={String(admin.id)}>
              {admin.name || admin.fullName || admin.email}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
        <Button type="submit" variant="contained" startIcon={<FilterAltOutlinedIcon />}>
          Apply filters
        </Button>
        <Button type="button" variant="outlined" startIcon={<RestartAltOutlinedIcon />} onClick={onReset}>
          Clear
        </Button>
      </Stack>
    </Box>
  );
}
