import {
  Box,
  Button,
  Container,
  InputLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { usePages } from "../../../../Hooks/usePages";
import { useState } from "react";

export default function CreatePage() {
  const { createNewPage } = usePages();
  const [key, setKey] = useState("");
  const handleSubmit = () => {
    createNewPage(key);
    setKey("");
  };
  return (
    <>
      <Container sx={{ mt: 5 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ m: 3 }}>
            Create New Page
          </Typography>
          <TextField
            label="Page Key"
            fullWidth
            required
            value={key}
            onChange={(e) => setKey(e.target.value)}
            helperText={
              "Think of this as the page’s nickname for the system. Visitors will never see it. Example: about, home, contact-us."
            }
            sx={{
              input: { color: "primary.main" },
              label: { color: "primary.main" },
            }}
          />
          <Box sx={{ m: 2, textAlign: "left" }}>
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              Page Key Rules:
              <br />• lowercase only
              <br />• use hyphens (-) instead of spaces
              <br />• no special characters
              <br />• must be unique
              <br />• 3 letters length at least
              <br />• 150 letters length at most
              <br />
              <br />
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              - Examples: about, home, contact-us, services-page
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              - After create the page, you may add new sections
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleSubmit}>
            Create New Page
          </Button>
        </Paper>
      </Container>
    </>
  );
}
