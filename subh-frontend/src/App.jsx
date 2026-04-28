import AboutPage from "./Pages/About/About.jsx";
import Home from "./Pages/Home/Home.jsx";
import ContactPage from "./Pages/Contact/ContactPage.jsx";
import EducationalPrograms from "./Pages/EducationalPrograms/EducationalPrograms.jsx";
import { Route, Routes } from "react-router-dom";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/educational/courses" element={<EducationalPrograms />} />
      </Routes>
    </>
  );
}

export default App;
