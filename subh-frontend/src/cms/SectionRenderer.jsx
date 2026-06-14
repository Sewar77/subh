import { SECTION_COMPONENTS } from "./sectionRegistry";

export default function SectionRenderer({ section }) {
  const Component = SECTION_COMPONENTS[section.type];

  if (!Component) {
    console.warn(`Unknown section type: ${section.type}`);

    return null;
  }

  return <Component section={section} />;
}
