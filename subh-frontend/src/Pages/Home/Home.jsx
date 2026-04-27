import { Container } from "@mui/material";
import About from "../../components/Home/About/About";
import Footer from "../../components/Home/Footer/Footer";
import Navbar from "../../components/Home/Navbar/Navbar";
import News from "../../components/Home/News/News";
import Questions from "../../components/Home/Questions/Questions";

export default function Home() {
  return (
    <>
      <Container>
        <Navbar />
        <News />
        <About />
        <Questions />
        <Footer />
      </Container>
    </>
  );
}
