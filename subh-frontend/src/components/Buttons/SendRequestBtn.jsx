import { Button, IconButton, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
export default function SendRequestBtn({ title, onClick }) {
  return (
    <Tooltip title={title}>
      <Button
        size="large"
        variant="outlined"
        onClick={onClick}
        sx={{
          borderColor: "secondary.main",
          borderRadius: 2,
          textTransform: "none",
          display: { xs: "none", sm: "inline-flex" },
          fontSize: 18,
          p: 2,
          color: "secondary.main",
        }}
      >
        {title}
      </Button>
    </Tooltip>
  );
}
