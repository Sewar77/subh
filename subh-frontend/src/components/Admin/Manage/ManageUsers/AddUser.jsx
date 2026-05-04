import {
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { useState } from "react";

export default function AddUser() {
  const [userType, setUserType] = useState("individual");

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
        Add User
      </Typography>

      <Paper
        sx={{
          mt: 3,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
        elevation={3}
      >
        <Typography fontWeight={700} color="text.secondary">
          User Info
        </Typography>
        <TextField
          label="First Name"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />
        <TextField
          label="Last Name"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />
        <TextField
          label="Username"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />
        <Divider />
        <FormControl>
          <FormLabel sx={{ color: "text.primary" }}>User Type</FormLabel>

          <RadioGroup
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <FormControlLabel
              value="individual"
              control={
                <Radio
                  sx={{
                    color: "#64748b",
                    "&.Mui-checked": {
                      color: "#6366f1",
                    },
                  }}
                />
              }
              label="Individual"
            />

            <FormControlLabel
              value="company"
              control={
                <Radio
                  sx={{
                    color: "#64748b",
                    "&.Mui-checked": {
                      color: "#6366f1",
                    },
                  }}
                />
              }
              label="Company"
            />
          </RadioGroup>
        </FormControl>
        <Divider />

        <TextField
          label="Address"
          multiline
          rows={3}
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />

        <TextField
          label="Phone Number"
          placeholder="+962..."
          type="tel"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
        />

        <Button variant="contained" size="large">
          Add User
        </Button>
      </Paper>
    </Container>
  );
}
