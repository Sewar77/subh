import { useEffect } from "react";
import SectionRenderer from "../../cms/SectionRenderer";
import { usePages } from "../../Hooks/usePages";
import Navbar from "../../components/Home/Navbar/Navbar";
import Footer from "../../components/Home/Footer/Footer";

export default function Home() {
  const { page, fetchPageByKey } = usePages();

  useEffect(() => {
    fetchPageByKey("home-page");
  }, [fetchPageByKey]);
  console.log(page);

  return (
    <>
      <Navbar />

      {page?.sections
        ?.sort((a, b) => a.position - b.position)
        .map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}

      <Footer />
    </>
  );
}
