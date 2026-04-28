import { Container } from "@mui/material";
import Footer from "../../components/Home/Footer/Footer";
import Navbar from "../../components/Home/Navbar/Navbar";
import Programs from "../../components/Educational/Programs/Programs.jsx";
export default function EducationalPrograms() {
  return (
    <>
      <Container sx={{ minHeight: "100vh" }}>
        <Navbar />
        <Programs />
        <Footer />
      </Container>
    </>
  );
}
