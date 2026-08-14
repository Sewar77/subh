import { useLanguage } from "../Context/LanguageContext";
import { SECTION_COMPONENTS } from "./sectionRegistry";
import { prepareSection } from "../Utils/sectionAdapter";

export default function SectionRenderer({ section, priority = false }) {
  const { language } = useLanguage();

  const preparedSection = prepareSection(section, language);
  const Component = preparedSection
    ? SECTION_COMPONENTS[preparedSection.templateKey]
    : null;

  if (!Component) return null;
  return <Component section={{ ...preparedSection, priority }} />;
}
