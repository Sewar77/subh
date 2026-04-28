import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import Footer from "../../components/Home/Footer/Footer";
import Navbar from "../../components/Home/Navbar/Navbar";

export default function Contact() {
  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          py: 8,
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
          src="/Contact_us-01.png"
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
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We are here to help! If you have any questions or need assistance,
              feel free to reach out to us.
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
              label="Full Name"
              required
              fullWidth
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
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
            </Box>

            <TextField
              label="Message"
              required
              fullWidth
              multiline
              rows={4}
              sx={{
                input: { color: "primary.main" },
                label: { color: "primary.main" },
              }}
            />

            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.2,
                fontWeight: 600,
              }}
            >
              Send Message
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
