import { Outlet } from "react-router-dom";
import Navbar from "../components/Home/Navbar/Navbar.jsx";
import Footer from "../components/Home/Footer/Footer.jsx";
import { Box, Container } from "@mui/material";
import { PagesProvider } from "../Context/pageContext.jsx";

export default function UserLayout() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Container
        component="main"
        maxWidth="xl"
        sx={{ flex: 1, width: "100%", py: { xs: 3, md: 5 } }}
      >
        <PagesProvider>
          <Outlet />
        </PagesProvider>
      </Container>
      <Footer />
    </Box>
  );
}
