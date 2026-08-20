import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { assetDimensions, assetName, formatBytes } from "./mediaFormatters.js";

export default function MediaAssetCard({ asset, onEdit, onSelect, selected = false }) {
  const name = assetName(asset);
  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column", borderColor: selected ? "primary.main" : undefined }}>
      <Box
        component="img"
        src={asset.url}
        alt={asset.altTextEn || asset.altTextAr || name}
        loading="lazy"
        width={asset.width || 640}
        height={asset.height || 360}
        sx={{ width: "100%", aspectRatio: "4 / 3", height: "auto", objectFit: "contain", bgcolor: "grey.100" }}
      />
      <CardContent sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Tooltip title={name}><Typography fontWeight={700} noWrap>{name}</Typography></Tooltip>
          <Chip size="small" label={asset.archived ? "Archived" : "Active"} color={asset.archived ? "default" : "success"} />
        </Stack>
        <Typography variant="body2" color="text.secondary">{assetDimensions(asset)}</Typography>
        <Typography variant="body2" color="text.secondary">{formatBytes(asset.bytes)}</Typography>
        <Typography variant="body2" color="text.secondary">
          {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : "Date unavailable"}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        {onSelect && (
          <Button fullWidth variant={selected ? "outlined" : "contained"} startIcon={<CheckCircleOutlineIcon />} onClick={() => onSelect(asset)}>
            {selected ? "Selected" : "Select"}
          </Button>
        )}
        {onEdit && (
          <Button fullWidth variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => onEdit(asset)} aria-label={`View and edit ${name}`}>
            Details
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
