import {
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function AddUser() {
  const [userType, setUserType] = useState();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setUserType(e.target.value);
  };
  return (
    <>
      <Container>
        <Typography variant="h4" sx={{ mt: 4, color: "text.secondary" }}>
          Add User
        </Typography>
        <Paper
          sx={{
            minHeight: "100vh",
            mt: 3,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            bgcolor: "background.default",
          }}
          elevation={4}
        >
          <TextField
            label="First Name"
            fullWidth
            sx={{ bgcolor: "text.primary", input: { color: "text.secondary" } }}
          />
          <TextField
            label="Last Name"
            fullWidth
            sx={{ bgcolor: "text.primary", input: { color: "text.secondary" } }}
          />
          <TextField
            label="UserName"
            fullWidth
            sx={{ bgcolor: "text.primary", input: { color: "text.secondary" } }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            sx={{ bgcolor: "text.primary", input: { color: "text.secondary" } }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            sx={{ bgcolor: "text.primary", input: { color: "text.secondary" } }}
          />
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">User Type</FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="individual"
              name="radio-buttons-group"
            >
              <FormControlLabel
                value="individual"
                control={<Radio />}
                label="Individual"
                sx={{
                  bgcolor: "text.primary",
                  color: "text.secondary",
                }}
              />
              <FormControlLabel
                value="company"
                control={<Radio />}
                label="Company"
                sx={{
                  bgcolor: "text.primary",
                  color: "text.secondary",
                }}
              />
            </RadioGroup>
          </FormControl>
          <TextField
            label="Address"
            multiline
            rows={3}
            fullWidth
            sx={{
              bgcolor: "text.primary",
              textarea: { color: "text.secondary" },
            }}
          />
          <TextField
            label="Phone Number"
            placeholder="+1 - 215-456-7890"
            type="tel"
            fullWidth
            sx={{ bgcolor: "text.primary", input: { color: "text.secondary" } }}
          />
          <Button variant="contained">Add the User</Button>
        </Paper>
      </Container>
    </>
  );
}
