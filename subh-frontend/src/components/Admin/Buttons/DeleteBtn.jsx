import { IconButton, Tooltip } from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function DeleteButton({ onClick }) {
  return (
    <Tooltip title="Delete">
      <IconButton size="small" color="error" onClick={onClick}>
        <DeleteOutlineOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
