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
import { useUser } from "../../../../Hooks/useUsers";
export default function AddUser() {
  const { addUser } = useUser();
  const [newUser, setNewUser] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    role: "",
    address: "",
    userType: "",
    phone_Number: "",
  });
  const handleAddUser = () => {
    addUser(newUser);
  };
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
          label="Full Name"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <Divider />
        <FormControl>
          <FormLabel sx={{ color: "text.primary" }}>User Type</FormLabel>
          <RadioGroup
            value={newUser.userType || "individual"}
            onChange={(e) =>
              setNewUser({ ...newUser, userType: e.target.value })
            }
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
        <FormControl>
          <FormLabel sx={{ color: "text.primary" }}>User Role</FormLabel>
          <RadioGroup
            value={newUser.userRole || "user"}
            onChange={(e) =>
              setNewUser({ ...newUser, userRole: e.target.value })
            }
          >
            <FormControlLabel
              value="admin"
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
              label="Admin"
            />
            <FormControlLabel
              value="user"
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
              label="User"
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
          value={newUser.address}
          onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
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
          value={newUser.phone_Number}
          onChange={(e) =>
            setNewUser({ ...newUser, phone_Number: e.target.value })
          }
        />
        <Button
          variant="contained"
          size="large"
          onClick={() => handleAddUser()}
        >
          Add User
        </Button>
      </Paper>
    </Container>
  );
}
