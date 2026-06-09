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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Hooks/useAuth";
export default function Register() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    phoneNumber: "",
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = () => {
    register(userInfo);
  };
  return (
    <>
      <Container
        sx={{
          py: 8,
          m: "auto",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap" },
          gap: 6,
          width: "100%",
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
            width: "100%",
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
                  color: "primary.main",
                }}
              >
                User Type
              </InputLabel>
              <Select
                label="User Type"
                required
                value={userInfo.userType}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, userType: e.target.value })
                }
              >
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={userInfo.name}
              onChange={(e) =>
                setUserInfo({ ...userInfo, name: e.target.value })
              }
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                flexWrap: {
                  xs: "wrap",
                  sm: "wrap",
                  md: "nowrap",
                  lg: "nowrap",
                },
              }}
            >
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={userInfo.email}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, email: e.target.value })
                }
                sx={{
                  input: { color: "primary.main" },
                  label: { color: "primary.main" },
                }}
              />
              <TextField
                label="Phone Number"
                fullWidth
                type="number"
                required
                value={userInfo.phoneNumber}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, phoneNumber: e.target.value })
                }
                sx={{
                  input: { color: "primary.main" },
                  label: { color: "primary.main" },
                }}
              />
            </Box>
            <TextField
              label="Password"
              fullWidth
              type="password"
              required
              value={userInfo.password}
              onChange={(e) =>
                setUserInfo({ ...userInfo, password: e.target.value })
              }
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />
            <TextField
              label="Confirm Password"
              fullWidth
              required
              type="password"
              value={userInfo.confirmPassword}
              onChange={(e) =>
                setUserInfo({ ...userInfo, confirmPassword: e.target.value })
              }
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />

            <Typography variant="body2">
              Already Have an Account?
              <Button onClick={() => navigate("/login")}>Login</Button>
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.2,
                fontWeight: 600,
              }}
              onClick={handleSubmit}
            >
              Register
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
