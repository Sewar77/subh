import { useEffect } from "react";
import SectionRenderer from "../../cms/SectionRenderer";
import { usePages } from "../../Hooks/usePages";
import Navbar from "../../components/Home/Navbar/Navbar";
import Footer from "../../components/Home/Footer/Footer";

export default function Home() {
  const { page, fetchPageByKey } = usePages();

  useEffect(() => {
    fetchPageByKey("about-page");
  }, [fetchPageByKey]);

  return (
    <>
      <Navbar />
      {page?.sections?.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
      <Footer />
    </>
  );
}
