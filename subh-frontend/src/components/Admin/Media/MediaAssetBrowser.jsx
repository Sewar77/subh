import { Alert, Box, LinearProgress, Pagination, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import useDebouncedValue from "../../../Hooks/useDebouncedValue.js";
import { listMediaAssets } from "../../../Services/mediaAssetService.js";
import MediaAssetCard from "./MediaAssetCard.jsx";

export default function MediaAssetBrowser({ status = "active", onSelect, onEdit, selectedId, refreshKey = 0 }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ assets: [], pagination: { page: 1, totalPages: 0, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listMediaAssets({ page, limit: 20, search: debouncedSearch || undefined, status }, { signal: controller.signal })
      .then(setResult)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedSearch, page, refreshKey, status]);

  return (
    <Stack spacing={2}>
      <TextField
        label="Search media"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
          setLoading(true);
          setError("");
        }}
        inputProps={{ "aria-label": "Search media by name or filename" }}
        fullWidth
      />
      {loading && <LinearProgress aria-label="Loading media assets" />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && result.assets.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
          <Typography variant="h6">No media found.</Typography>
          <Typography color="text.secondary">Try another search or status filter.</Typography>
        </Box>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
        {result.assets.map((asset) => (
          <MediaAssetCard key={asset.id} asset={asset} onSelect={onSelect} onEdit={onEdit} selected={String(asset.id) === String(selectedId)} />
        ))}
      </Box>
      {result.pagination.totalPages > 1 && (
        <Pagination count={result.pagination.totalPages} page={result.pagination.page} onChange={(_, nextPage) => { setLoading(true); setError(""); setPage(nextPage); }} color="primary" sx={{ alignSelf: "center" }} aria-label="Media Library pages" />
      )}
    </Stack>
  );
}
