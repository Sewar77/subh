import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { restoreMediaAsset, updateMediaAssetMetadata } from "../../../Services/mediaAssetService.js";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal.jsx";
import { assetDimensions, assetName, formatBytes } from "./mediaFormatters.js";

const metadataFromAsset = (asset) => ({
  displayName: asset?.displayName || "",
  altTextEn: asset?.altTextEn || "",
  altTextAr: asset?.altTextAr || "",
});

function Detail({ label, value }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ overflowWrap: "anywhere" }}>{value || "Not available"}</Typography></Box>;
}

export default function MediaAssetDetailsDialog({ asset, open, onClose, onUpdated, onArchive }) {
  const [metadata, setMetadata] = useState(() => metadataFromAsset(asset));
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  if (!asset) return null;

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      const updated = await updateMediaAssetMetadata(asset.id, metadata);
      setMetadata(metadataFromAsset(updated));
      onUpdated(updated);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    try {
      setRestoring(true);
      setError("");
      const updated = await restoreMediaAsset(asset.id);
      onUpdated(updated);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={saving || restoring ? undefined : onClose} fullWidth maxWidth="md">
        <DialogTitle>Media details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <Box component="img" src={asset.url} alt={asset.altTextEn || asset.altTextAr || assetName(asset)} loading="lazy" sx={{ width: "100%", maxHeight: 320, aspectRatio: "16 / 9", objectFit: "contain", bgcolor: "grey.100", borderRadius: 2 }} />
            <Stack spacing={2}>
              <TextField label="Display name" value={metadata.displayName} inputProps={{ maxLength: 200 }} onChange={(event) => setMetadata((current) => ({ ...current, displayName: event.target.value }))} />
              <TextField label="English alt text" value={metadata.altTextEn} inputProps={{ dir: "ltr", maxLength: 500 }} onChange={(event) => setMetadata((current) => ({ ...current, altTextEn: event.target.value }))} />
              <TextField label="Arabic alt text" value={metadata.altTextAr} inputProps={{ dir: "rtl", maxLength: 500 }} onChange={(event) => setMetadata((current) => ({ ...current, altTextAr: event.target.value }))} />
            </Stack>
            <Divider />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
              <Detail label="Original filename" value={asset.originalFilename} />
              <Detail label="Dimensions" value={assetDimensions(asset)} />
              <Detail label="Format" value={asset.format || asset.mimeType} />
              <Detail label="File size" value={formatBytes(asset.bytes)} />
              <Detail label="Uploaded" value={asset.createdAt ? new Date(asset.createdAt).toLocaleString() : null} />
              <Detail label="Uploader" value={asset.uploader?.fullName} />
              <Detail label="Source" value={asset.source} />
              <Detail label="State" value={asset.archived ? "Archived" : "Active"} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, flexWrap: "wrap" }}>
          {asset.archived ? (
            <Button startIcon={restoring ? <CircularProgress size={18} /> : <RestoreOutlinedIcon />} disabled={restoring || saving} onClick={restore}>Restore</Button>
          ) : (
            <Button color="warning" startIcon={<ArchiveOutlinedIcon />} disabled={saving} onClick={() => setConfirmOpen(true)}>Archive</Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={onClose} disabled={saving || restoring}>Close</Button>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />} disabled={saving || restoring} onClick={save}>Save metadata</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDeleteModal
        open={confirmOpen}
        title="Archive media asset?"
        message="The asset remains on Cloudinary and existing pages will continue to work. It will no longer appear in the active Media Library picker."
        confirmLabel="Archive"
        severity="warning"
        loading={archiving}
        error={error}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            setArchiving(true);
            await onArchive(asset);
            setConfirmOpen(false);
          } catch (requestError) {
            setError(requestError.message);
          } finally {
            setArchiving(false);
          }
        }}
      />
    </>
  );
}
