import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
export default function AddButton({ label, to }) {
  const navigate = useNavigate();
  return (
    <Button variant="contained" onClick={() => navigate(to)}>
      Add {label} +
    </Button>
  );
}
