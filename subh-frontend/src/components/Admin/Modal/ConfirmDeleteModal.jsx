import { Box, Modal, Typography, Button, Stack } from "@mui/material";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  label,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 5,
          textAlign: "center",
          m: "auto",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Confirm Deletion
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          Are you sure you want to delete this {label}?
          <br />
          <span sx={{ color: "error.main" }}>
            This action cannot be undone.
          </span>
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "center", mt: 3 }}
        >
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="contained" color="error" onClick={onConfirm}>
            Delete
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
