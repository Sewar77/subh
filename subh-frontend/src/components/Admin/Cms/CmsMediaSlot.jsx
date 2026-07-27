import { useId, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CmsMediaItem from "./CmsMediaItem.jsx";
import { humanize } from "./cmsUtils.js";

const acceptedTypes = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/mpeg",
  file: "application/pdf",
};

const mediaTypeForFile = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
};

export default function CmsMediaSlot({
  slot,
  items,
  busy,
  onAdd,
  onReplace,
  onSaveMetadata,
  onDelete,
  onReorder,
}) {
  const inputId = useId();
  const [error, setError] = useState("");
  const orderedItems = [...items].sort(
    (left, right) => left.position - right.position,
  );
  const atLimit = orderedItems.length >= slot.maxItems;
  const singleWithItem = !slot.multiple && orderedItems.length === 1;
  const accept = slot.mediaTypes
    .map((type) => acceptedTypes[type])
    .filter(Boolean)
    .join(",");

  const handleFile = async (file) => {
    if (!file) return;
    const mediaType = mediaTypeForFile(file);
    if (!slot.mediaTypes.includes(mediaType)) {
      setError(`${humanize(mediaType)} files are not allowed in this slot.`);
      return;
    }

    try {
      setError("");
      if (singleWithItem) {
        if (mediaType !== orderedItems[0].mediaType) {
          setError(
            `Replacement must remain ${humanize(orderedItems[0].mediaType)} media.`,
          );
          return;
        }
        await onReplace(orderedItems[0], file);
      } else {
        await onAdd(slot, file, mediaType);
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleMove = async (fromIndex, toIndex) => {
    const reordered = [...orderedItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    try {
      setError("");
      await onReorder(slot, reordered);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
        >
          <Box>
            <Typography variant="h6">{humanize(slot.key)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {slot.multiple ? "Multiple items" : "Single item"} · Maximum{" "}
              {slot.maxItems}
              {slot.required ? " · Required" : ""}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {slot.mediaTypes.map((type) => (
              <Chip key={type} label={humanize(type)} size="small" />
            ))}
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {orderedItems.length === 0 ? (
          <Typography color="text.secondary">
            No media has been added to this slot.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {orderedItems.map((item, index) => (
              <CmsMediaItem
                key={`${item.id}-${item.updatedAt || ""}`}
                item={item}
                index={index}
                total={orderedItems.length}
                required={slot.required}
                busy={busy}
                replaceAccept={acceptedTypes[item.mediaType]}
                onReplace={
                  slot.multiple
                    ? (target, file) => onReplace(target, file)
                    : undefined
                }
                onSaveMetadata={onSaveMetadata}
                onDelete={onDelete}
                onMove={handleMove}
              />
            ))}
          </Stack>
        )}

        <Button
          component="label"
          htmlFor={inputId}
          variant="contained"
          startIcon={busy ? <CircularProgress size={18} /> : <CloudUploadIcon />}
          disabled={busy || (atLimit && !singleWithItem)}
        >
          {singleWithItem ? "Replace media" : "Upload media"}
          <input
            id={inputId}
            hidden
            type="file"
            accept={accept}
            onChange={(event) => {
              const [file] = event.target.files || [];
              handleFile(file);
              event.target.value = "";
            }}
          />
        </Button>
      </Stack>
    </Paper>
  );
}
