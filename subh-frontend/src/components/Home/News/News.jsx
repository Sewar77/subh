import { Button, Stack, Typography, Paper, Box } from "@mui/material";
import NewsCarousel from "./NewsCarousel";
import About from "../About/About";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";

export default function News() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <Box
      sx={{
        py: 4,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: "text.primary",
          fontWeight: 700,
          mb: 2,
        }}
      >
        Welcome to Subh
      </Typography>

      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          justifyContent: "center",
          my: 4,
        }}
      >
        <Button
          variant="contained"
          sx={{
            background: `linear-gradient(90deg,  rgb(255, 0, 255),#613389)`,
            color: "#fff",
            fontWeight: 600,
            borderRadius: 3,
            textTransform: "none",
            display: { xs: "none", sm: "flex" },
            "&:hover": {
              background: `linear-gradient(45deg, rgb(0, 255, 255), rgb(255, 0, 255))`,
            },
          }}
          onClick={() => navigate("/news")}
        >
          Discover More
        </Button>
        {user ? (
          <>
            <Button
              variant="contained"
              sx={{
                color: "#fff",
                fontWeight: 600,
                background: `linear-gradient(90deg,  rgb(255, 0, 255),#613389)`,
                borderRadius: 3,
                textTransform: "none",
                display: { xs: "none", sm: "flex" },
                "&:hover": {
                  background: `linear-gradient(45deg, rgb(0, 255, 255), rgb(255, 0, 255))`,
                },
              }}
              onClick={() => navigate("/subh/books")}
            >
              Explore Books
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            sx={{
              color: "#fff",
              fontWeight: 600,
              background: `linear-gradient(90deg,  rgb(255, 0, 255),#613389)`,
              borderRadius: 3,
              textTransform: "none",
              display: { xs: "none", sm: "flex" },
              "&:hover": {
                background: `linear-gradient(45deg, rgb(0, 255, 255), rgb(255, 0, 255))`,
              },
            }}
            onClick={() => navigate("/register")}
          >
            Sign Up Now
          </Button>
        )}
      </Stack>

      <Paper
        elevation={4}
        sx={{
          p: 2,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" sx={{ color: "white" }}>
          Hot News
        </Typography>
        <NewsCarousel />
      </Paper>
    </Box>
  );
}
