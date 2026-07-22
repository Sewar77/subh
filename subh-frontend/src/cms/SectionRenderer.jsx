import { useLanguage } from "../Context/LanguageContext";
import { SECTION_COMPONENTS } from "./sectionRegistry";

export default function SectionRenderer({ section }) {
  const { language } = useLanguage();

  const Component = SECTION_COMPONENTS[section.type];
  console.log(section.type);

  if (!Component) return null;

  const translation =
    section.translations?.find((t) => t.locale === language) ||
    section.translations?.[0];

  if (!translation) return null;

  return (
    <Component
      section={{
        ...section,
        title: translation.title,
        content: translation.content,
      }}
    />
  );
}
