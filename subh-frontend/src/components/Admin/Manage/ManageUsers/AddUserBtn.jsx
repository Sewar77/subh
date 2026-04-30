import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AddUserBtn() {
  const navigate = useNavigate();
  return (
    <>
      <Button variant="contained" onClick={() => navigate("/admin/add/user")}>
        Add User +{" "}
      </Button>
    </>
  );
}
