import { useEffect, useId, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { uploadMediaAsset } from "../../../Services/mediaAssetService.js";

const EMPTY_METADATA = { displayName: "", altTextEn: "", altTextAr: "" };

export default function MediaUploadDialog({ open, onClose, onUploaded }) {
  const inputId = useId();
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(EMPTY_METADATA);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const close = () => {
    setFile(null);
    setMetadata(EMPTY_METADATA);
    setError("");
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Choose an image to upload.");
      return;
    }
    try {
      setUploading(true);
      setError("");
      const asset = await uploadMediaAsset(file, metadata);
      await onUploaded(asset);
      close();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={uploading ? undefined : close} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={submit}>
        <DialogTitle>Upload Media</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="Selected upload preview"
                sx={{ width: "100%", aspectRatio: "16 / 9", objectFit: "contain", bgcolor: "grey.100", borderRadius: 2 }}
              />
            )}
            <Button component="label" htmlFor={inputId} variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
              {file ? "Choose another image" : "Choose image"}
              <input
                id={inputId}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </Button>
            {file && <Typography variant="body2" color="text.secondary">{file.name}</Typography>}
            <TextField label="Display name (optional)" value={metadata.displayName} inputProps={{ maxLength: 200 }} onChange={(event) => setMetadata((current) => ({ ...current, displayName: event.target.value }))} />
            <TextField label="English alt text (optional)" value={metadata.altTextEn} inputProps={{ dir: "ltr", maxLength: 500 }} onChange={(event) => setMetadata((current) => ({ ...current, altTextEn: event.target.value }))} />
            <TextField label="Arabic alt text (optional)" value={metadata.altTextAr} inputProps={{ dir: "rtl", maxLength: 500 }} onChange={(event) => setMetadata((current) => ({ ...current, altTextAr: event.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close} disabled={uploading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={uploading || !file} startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadOutlinedIcon />}>
            Upload Media
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
