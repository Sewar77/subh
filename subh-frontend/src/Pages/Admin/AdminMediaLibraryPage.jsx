import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import toast from "react-hot-toast";
import AdminInstructions from "../../components/Admin/AdminInstructions.jsx";
import MediaAssetBrowser from "../../components/Admin/Media/MediaAssetBrowser.jsx";
import MediaAssetDetailsDialog from "../../components/Admin/Media/MediaAssetDetailsDialog.jsx";
import MediaUploadDialog from "../../components/Admin/Media/MediaUploadDialog.jsx";
import { archiveMediaAsset } from "../../Services/mediaAssetService.js";

export default function AdminMediaLibraryPage() {
  const [status, setStatus] = useState("active");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const refresh = () => setRefreshKey((current) => current + 1);
  const updated = (asset) => {
    setSelected(asset);
    refresh();
    toast.success("Media asset updated.");
  };
  const archive = async (asset) => {
    const archived = await archiveMediaAsset(asset.id);
    setSelected(archived);
    refresh();
    toast.success("Media asset archived.");
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, minWidth: 0 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1">Media Library</Typography>
          <Typography color="text.secondary">Upload once, manage metadata, and reuse active images across Subh.</Typography>
        </Box>
        <Button variant="contained" startIcon={<CloudUploadOutlinedIcon />} onClick={() => setUploadOpen(true)}>Upload Media</Button>
      </Stack>
      <AdminInstructions>
        Search and page through media on the server. Archiving keeps the Cloudinary asset and existing page references intact while hiding it from normal selection.
      </AdminInstructions>
      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}
      <FormControl size="small" sx={{ width: { xs: "100%", sm: 220 }, mb: 2 }}>
        <InputLabel id="media-status-label">Status</InputLabel>
        <Select labelId="media-status-label" label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
          <MenuItem value="all">All</MenuItem>
        </Select>
      </FormControl>
      <MediaAssetBrowser key={`${status}-${refreshKey}`} status={status} onEdit={setSelected} refreshKey={refreshKey} />
      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={async () => {
          setStatus("active");
          refresh();
          toast.success("Media uploaded.");
        }}
      />
      <MediaAssetDetailsDialog
        key={selected?.id || "media-details"}
        asset={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onUpdated={updated}
        onArchive={archive}
      />
    </Box>
  );
}
