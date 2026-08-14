import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onCancel = onClose,
  onConfirm,
  label,
  title = "Confirm deletion",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  severity = "error",
  error = "",
  confirmDisabled = false,
  confirmAutoFocus = true,
  children,
}) {
  const description =
    message ||
    `Are you sure you want to delete this ${label || "item"}? This action cannot be undone.`;
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      fullWidth
      maxWidth="xs"
      aria-labelledby="confirm-action-title"
    >
      <DialogTitle id="confirm-action-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        {children}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={severity === "error" ? "error" : "primary"}
          onClick={onConfirm}
          disabled={loading || confirmDisabled}
          autoFocus={confirmAutoFocus}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            confirmLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
