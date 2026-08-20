import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import MediaAssetBrowser from "./MediaAssetBrowser.jsx";
import MediaUploadDialog from "./MediaUploadDialog.jsx";

export default function MediaPicker({
  value,
  onSelect,
  disabled = false,
  acceptLibrary = true,
  uploadLabel = "Upload New",
  replaceLabel = "Replace from Computer",
  libraryLabel = "Choose from Media Library",
  previewAspectRatio = "16 / 9",
  previewObjectFit = "contain",
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectionError, setSelectionError] = useState("");
  const currentUrl = value?.url || value?.fileRef || "";

  const select = async (asset) => {
    try {
      setSelectionError("");
      await onSelect(asset);
      setLibraryOpen(false);
    } catch (error) {
      setSelectionError(error.message || "The image could not be selected.");
      throw error;
    }
  };

  return (
    <Stack spacing={1.5}>
      {currentUrl && (
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Current image</Typography>
          <Box component="img" src={currentUrl} alt={value?.altTextEn || value?.altEn || value?.altTextAr || value?.altAr || "Current selected image"} loading="lazy" sx={{ width: "100%", maxWidth: 240, maxHeight: 360, aspectRatio: previewAspectRatio, objectFit: previewObjectFit, bgcolor: "grey.100", borderRadius: 2 }} />
        </Box>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant={currentUrl ? "outlined" : "contained"} startIcon={<CloudUploadOutlinedIcon />} disabled={disabled} onClick={() => { setSelectionError(""); setUploadOpen(true); }}>
          {currentUrl ? replaceLabel : uploadLabel}
        </Button>
        {acceptLibrary && (
          <Button variant="outlined" startIcon={<PhotoLibraryOutlinedIcon />} disabled={disabled} onClick={() => { setSelectionError(""); setLibraryOpen(true); }}>
            {libraryLabel}
          </Button>
        )}
      </Stack>

      <MediaUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={select} />
      <Dialog open={libraryOpen} onClose={() => setLibraryOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Choose from Media Library</DialogTitle>
        <DialogContent dividers>
          {selectionError && <Alert severity="error" sx={{ mb: 2 }}>{selectionError}</Alert>}
          <MediaAssetBrowser status="active" onSelect={(asset) => { void select(asset).catch(() => {}); }} selectedId={value?.id} />
        </DialogContent>
        <DialogActions><Button onClick={() => setLibraryOpen(false)}>Cancel</Button></DialogActions>
      </Dialog>
    </Stack>
  );
}
