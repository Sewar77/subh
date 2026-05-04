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
import { useAuth } from "../../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  console.log(userData);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleLogin = () => {
    login(userData);
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
          minWidth: "100%",
        }}
      >
        <Box
          component="img"
          src="/loginlogo.svg"
          sx={{ width: "20rem", height: "25rem" }}
        />
        <Box
          sx={{
            backdropFilter: "blur(30px)",
            backgroundColor: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(0, 0, 0, 0.3)",
            p: 4,
            borderRadius: 3,
            color: "text.primary",
            minWidth: "50%",
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Continue you journy with Subh Platform!
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
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              required
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />
            <Typography variant="body2">
              Don`t have an account?
              <Button onClick={() => navigate("/register")}>Register</Button>
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.2,
                fontWeight: 600,
              }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
