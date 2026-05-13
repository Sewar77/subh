import { Button, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
export default function AddButton({ label, to }) {
  const navigate = useNavigate();
  return (
    <Button
      sx={{ fontSize: 20 }}
      variant="contained"
      onClick={() => navigate(to)}
    >
      Add {label} +
    </Button>
  );
}
