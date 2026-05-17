import { Outlet } from "react-router-dom";
import Navbar from "../components/Home/Navbar/Navbar.jsx";
import Footer from "../components/Home/Footer/Footer.jsx";
import { Container } from "@mui/material";

export default function UserLayout() {
  return (
    <>
      <Container>
        <Navbar />
        <Outlet />
        <Footer />
      </Container>
    </>
  );
}
