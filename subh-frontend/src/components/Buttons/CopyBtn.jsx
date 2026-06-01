import { IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { copyToClipboard } from "../../Utils/copyToClipboard";
export default function CopyButton({
  text,
  tooltip = "Copy",
  successMessage = "Copied",
}) {
  const handleCopy = () => {
    if (!text) return;
    copyToClipboard(text, successMessage);
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton onClick={handleCopy}>
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
  );
}
