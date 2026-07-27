import { Alert, Box, Chip, CircularProgress, Container, Paper, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { authContext } from "../../Context/authContextValue.js";

const formatDate = (value) => value ? new Date(value).toLocaleString() : "Not provided";
const Detail = ({ label, value }) => <Box><Typography variant="subtitle2" color="text.secondary">{label}</Typography><Typography sx={{ mt: 0.5, overflowWrap: "anywhere" }}>{value ?? "Not provided"}</Typography></Box>;

export default function AdminProfilePage() {
  const { user, authLoading } = useContext(authContext);

  if (authLoading) return <Box role="status" aria-live="polite" sx={{ py: 8, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading your profile...</Typography></Box>;
  if (!user) return <Container maxWidth="md" sx={{ py: 3 }}><Alert severity="error">Your administrator profile could not be loaded. Please sign in again.</Alert></Container>;

  return <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1">Administrator profile</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Review your account details. Profile editing is not available because the current API has no safe own-profile update endpoint.</Typography>
      </Box>
      <Paper sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5">Account status</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip label={user.role || "Administrator"} color="primary" />
              <Chip label={user.isActive ? "Active" : "Inactive"} color={user.isActive ? "success" : "default"} />
              <Chip label={user.emailVerified ? "Email verified" : "Email not verified"} color={user.emailVerified ? "success" : "default"} />
            </Stack>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: { xs: 2.5, md: 3 } }}>
            <Detail label="Name" value={user.fullName || user.name} />
            <Detail label="Email" value={user.email} />
            <Detail label="Role" value={user.role} />
            <Detail label="User type" value={user.userType} />
            <Detail label="Phone number" value={user.phoneNumber} />
            <Detail label="Account ID" value={user.id} />
            <Detail label="Created" value={formatDate(user.createdAt)} />
            <Detail label="Last updated" value={formatDate(user.updatedAt)} />
          </Box>
        </Stack>
      </Paper>
    </Stack>
  </Container>;
}
