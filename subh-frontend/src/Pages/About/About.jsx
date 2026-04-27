import { Container } from "@mui/material";
import Footer from "../../components/Home/Footer/Footer";
import Navbar from "../../components/Home/Navbar/Navbar";
import About from "../../components/About/About.jsx";

export default function AboutPage() {
  return (
    <>
      <Container>
        <Navbar />
        <About />
        <Footer />
      </Container>
    </>
  );
}
