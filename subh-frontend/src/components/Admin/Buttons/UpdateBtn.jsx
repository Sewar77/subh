import { IconButton, Tooltip } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

export default function UpdateBtn({ onClick }) {
  return (
    <Tooltip title="Edit">
      <IconButton size="small" color="primary" onClick={onClick}>
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
