import { Button } from "@mui/material";

export default function ViewButton({ onClick }) {
  return (
    <Button
      size="small"
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        display: { xs: "none", sm: "inline-flex" },
      }}
    >
      View
    </Button>
  );
}
