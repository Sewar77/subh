import { Box, Button, Container, Typography } from "@mui/material";
import { HomeRounded, SentimentVeryDissatisfied } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          width: "100%",
        }}
      >
        <SentimentVeryDissatisfied
          sx={{
            fontSize: {
              xs: 90,
              md: 130,
            },
            color: "primary.main",
            mb: 2,
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: {
              xs: "4rem",
              md: "7rem",
            },
            lineHeight: 1,
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mt: 2,
            fontSize: {
              xs: "1.7rem",
              md: "2.5rem",
            },
          }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mt: 2,
            maxWidth: 500,
            mx: "auto",
            fontSize: {
              xs: "1rem",
              md: "1.2rem",
            },
          }}
        >
          The page you are trying to access does not exist, was moved, or got
          emotionally destroyed by React Router.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<HomeRounded />}
          onClick={() => navigate("/")}
          sx={{
            mt: 4,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: "1rem",
            fontWeight: 700,
          }}
        >
          Back To Home
        </Button>
      </Box>
    </Container>
  );
}
