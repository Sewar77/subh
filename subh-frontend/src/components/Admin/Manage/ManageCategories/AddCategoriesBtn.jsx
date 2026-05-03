import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AddCategoriesBtn() {
  const navigate = useNavigate();
  return (
    <>
      <Button
        variant="contained"
        onClick={() => navigate("/admin/new-category")}
      >
        Add New Category
      </Button>
    </>
  );
}
