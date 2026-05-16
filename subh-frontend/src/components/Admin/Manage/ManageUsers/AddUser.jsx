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
import toast from "react-hot-toast";
export default function AddUser() {
  const { addUser } = useUser();
  const [newUser, setNewUser] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    userRole: "user",
    address: "",
    userType: "individual",
    phone_Number: "",
  });

  const handleAddUser = () => {
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.password ||
      !newUser.confirmPassword ||
      !newUser.userRole ||
      !newUser.userType
    ) {
      toast("Should fill all feilds! \n \n يجب ملء جميع الحقول ", {
        style: {
          border: "1px solid #6366f1",
          padding: "16px",
          color: "#000",
          fontWeight: 500,
        },
      });
      return;
    }    
    addUser(newUser);
  };

  const handleClearForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      role: "",
      phone_Number: "",
    });
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
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          sx={{
            input: { color: "text.primary" },
            label: { color: "text.primary" },
          }}
          value={newUser.confirmPassword}
          onChange={(e) =>
            setNewUser({ ...newUser, confirmPassword: e.target.value })
          }
        />
        <Divider />
        <FormControl>
          <FormLabel sx={{ color: "text.primary" }}>User Type</FormLabel>
          <RadioGroup
            value={newUser.userType}
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
            value={newUser.userRole}
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
        <Button
          variant="contained"
          size="large"
          onClick={() => handleClearForm()}
        >
          Clear
        </Button>
      </Paper>
    </Container>
  );
}
