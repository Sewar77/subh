import { useId, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const metadataFromItem = (item) => ({
  altEn: item.altEn || "",
  altAr: item.altAr || "",
  captionEn: item.captionEn || "",
  captionAr: item.captionAr || "",
});

export default function CmsMediaItem({
  item,
  index,
  total,
  required,
  busy,
  replaceAccept,
  onReplace,
  onSaveMetadata,
  onDelete,
  onMove,
}) {
  const replaceInputId = useId();
  const [metadata, setMetadata] = useState(() => metadataFromItem(item));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const dirty =
    JSON.stringify(metadata) !== JSON.stringify(metadataFromItem(item));

  const handleSave = async () => {
    try {
      setError("");
      await onSaveMetadata(item, metadata);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const preview =
    item.mediaType === "image" ? (
      <Box
        component="img"
        src={item.fileRef}
        alt={item.altEn || item.altAr || `Media item ${index + 1}`}
        sx={{
          width: "100%",
          maxHeight: 220,
          objectFit: "cover",
          borderRadius: 2,
          bgcolor: "grey.100",
        }}
      />
    ) : item.mediaType === "video" ? (
      <Box
        component="video"
        src={item.fileRef}
        controls
        aria-label={item.altEn || `Video item ${index + 1}`}
        sx={{ width: "100%", maxHeight: 220, borderRadius: 2 }}
      />
    ) : (
      <Button
        component="a"
        href={item.fileRef}
        target="_blank"
        rel="noreferrer"
        variant="outlined"
      >
        Open file
      </Button>
    );

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={1}
          >
            <Typography fontWeight={700}>
              Item {index + 1} · {item.mediaType}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Move media up">
                <span>
                  <IconButton
                    aria-label="Move media up"
                    disabled={busy || index === 0}
                    onClick={() => onMove(index, index - 1)}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move media down">
                <span>
                  <IconButton
                    aria-label="Move media down"
                    disabled={busy || index === total - 1}
                    onClick={() => onMove(index, index + 1)}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title={
                  required && total === 1
                    ? "This slot requires one media item"
                    : "Remove media"
                }
              >
                <span>
                  <IconButton
                    color="error"
                    aria-label="Remove media"
                    disabled={busy || (required && total === 1)}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {/* <DeleteOutlineIcon /> */}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {preview}

          {error && <Alert severity="error">{error}</Alert>}

          {onReplace && (
            <Button
              component="label"
              htmlFor={replaceInputId}
              variant="outlined"
              startIcon={<CloudUploadOutlinedIcon />}
              disabled={busy}
            >
              Replace file
              <input
                id={replaceInputId}
                hidden
                type="file"
                accept={replaceAccept}
                onChange={async (event) => {
                  const [file] = event.target.files || [];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    setError("");
                    await onReplace(item, file);
                  } catch (requestError) {
                    setError(requestError.message);
                  }
                }}
              />
            </Button>
          )}

          <TextField
            label="English alt text"
            value={metadata.altEn}
            inputProps={{ dir: "ltr", maxLength: 160 }}
            onChange={(event) =>
              setMetadata((current) => ({
                ...current,
                altEn: event.target.value,
              }))
            }
          />
          <TextField
            label="Arabic alt text"
            value={metadata.altAr}
            inputProps={{ dir: "rtl", maxLength: 160 }}
            onChange={(event) =>
              setMetadata((current) => ({
                ...current,
                altAr: event.target.value,
              }))
            }
          />
          <TextField
            label="English caption"
            value={metadata.captionEn}
            multiline
            minRows={2}
            inputProps={{ dir: "ltr", maxLength: 400 }}
            onChange={(event) =>
              setMetadata((current) => ({
                ...current,
                captionEn: event.target.value,
              }))
            }
          />
          <TextField
            label="Arabic caption"
            value={metadata.captionAr}
            multiline
            minRows={2}
            inputProps={{ dir: "rtl", maxLength: 400 }}
            onChange={(event) =>
              setMetadata((current) => ({
                ...current,
                captionAr: event.target.value,
              }))
            }
          />
          <Button
            variant="outlined"
            disabled={!dirty || busy}
            onClick={handleSave}
          >
            Save media metadata
          </Button>
        </Stack>
      </CardContent>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Remove media item?</DialogTitle>
        <DialogContent>
          This removes the item from this section. The section itself is not
          deleted.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              setConfirmOpen(false);
              try {
                setError("");
                await onDelete(item);
              } catch (requestError) {
                setError(requestError.message);
              }
            }}
          >
            Remove media
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
