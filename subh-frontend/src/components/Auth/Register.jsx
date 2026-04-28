import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
export default function Register() {
  const [userType, setUserType] = useState();
  const handleChange = (e) => {
    setUserType(e.target.value);
  };
  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          py: 8,
          m: "auto",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap" },
          gap: 6,
          minWidth: "100%",
        }}
      >
        <Box
          component="img"
          src="/loginlogo.svg"
          sx={{ width: "22rem", height: "25rem" }}
        />
        <Box
          sx={{
            backdropFilter: "blur(30px)",
            backgroundColor: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(0, 0, 0, 0.3)",
            p: 4,
            borderRadius: 3,
            color: "text.primary",
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Join Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lock Subh Platform!
            </Typography>
          </Box>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <FormControl>
              <InputLabel
                sx={{
                  input: { color: "primary.main" },
                  label: { color: "primary.main" },
                }}
              >
                User Type
              </InputLabel>
              <Select
                label="User Type"
                onChange={handleChange}
                value={userType}
                sx={{
                  input: { color: "primary.main" },
                  label: { color: "primary.main" },
                }}
              >
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              <TextField
                label="First Name"
                required
                fullWidth
                sx={{
                  input: { color: "primary.main" },
                  label: { color: "primary.main" },
                }}
              />
              <TextField
                label="Last Name"
                required
                fullWidth
                sx={{
                  input: { color: "primary.main" },
                  label: { color: "primary.main" },
                }}
              />
            </Box>

            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />
            <TextField
              label="Phone Number"
              fullWidth
              type="number"
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />
            <Typography variant="body2">
              Already Have an Account? LoginIn
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.2,
                fontWeight: 600,
              }}
            >
              Register
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
