const FIELD_TYPES = new Set([
  "text",
  "textarea",
  "url",
  "boolean",
  "integer",
  "decimal",
]);
const MEDIA_TYPES = new Set(["image", "video", "file"]);

const field = (
  key,
  type,
  {
    localized = true,
    required = false,
    nullable = !required,
    maxLength,
  } = {},
) => ({ key, type, localized, required, nullable, maxLength });

const mediaSlot = (
  key,
  mediaTypes,
  { multiple = false, required = false, maxItems = 1 } = {},
) => ({ key, mediaTypes, multiple, required, maxItems });

const definitions = {
  hero: {
    key: "hero",
    component: "HeroSection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { maxLength: 1000 }),
      field("buttonText", "text", { maxLength: 80 }),
      field("buttonLink", "url", {
        localized: false,
        maxLength: 2048,
      }),
    ],
    mediaSlots: [mediaSlot("background", ["image"])],
  },
  image: {
    key: "image",
    component: "ImageSection",
    fields: [],
    mediaSlots: [mediaSlot("image", ["image"], { required: true })],
  },
  text: {
    key: "text",
    component: "TextSection",
    fields: [
      field("title", "text", { maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 5000 }),
    ],
    mediaSlots: [],
  },
  media: {
    key: "media",
    component: "MediaSection",
    fields: [field("title", "text", { maxLength: 160 })],
    mediaSlots: [
      mediaSlot("media", ["image"], {
        multiple: true,
        maxItems: 10,
      }),
    ],
  },
  image_text: {
    key: "image_text",
    component: "ImageTextSection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 2000 }),
    ],
    mediaSlots: [mediaSlot("image", ["image"], { required: true })],
  },
  text_image: {
    key: "text_image",
    component: "ImageTextSection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 2000 }),
    ],
    mediaSlots: [mediaSlot("image", ["image"], { required: true })],
  },
  banner: {
    key: "banner",
    component: "BannerSection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { maxLength: 300 }),
    ],
    mediaSlots: [],
  },
  summary: {
    key: "summary",
    component: "SummarySection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 800 }),
    ],
    mediaSlots: [],
  },
};

const deepFreeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
};

export const validateRegistryIntegrity = (registry = definitions) => {
  const errors = [];
  const templateKeys = new Set();

  for (const [registryKey, template] of Object.entries(registry)) {
    if (!template || typeof template !== "object") {
      errors.push(`Template ${registryKey} must be an object`);
      continue;
    }

    if (template.key !== registryKey) {
      errors.push(`Template ${registryKey} has a mismatched key`);
    }
    if (templateKeys.has(template.key)) {
      errors.push(`Duplicate template key: ${template.key}`);
    }
    templateKeys.add(template.key);

    if (!Array.isArray(template.fields) || !Array.isArray(template.mediaSlots)) {
      errors.push(`Template ${registryKey} must define fields and mediaSlots`);
      continue;
    }

    const fieldKeys = new Set();
    for (const definition of template.fields) {
      if (!definition.key || fieldKeys.has(definition.key)) {
        errors.push(`Template ${registryKey} has an invalid field key`);
      }
      fieldKeys.add(definition.key);
      if (!FIELD_TYPES.has(definition.type)) {
        errors.push(`Field ${registryKey}.${definition.key} has invalid type`);
      }
      for (const flag of ["localized", "required", "nullable"]) {
        if (typeof definition[flag] !== "boolean") {
          errors.push(`Field ${registryKey}.${definition.key} needs ${flag}`);
        }
      }
      if (!Number.isInteger(definition.maxLength) || definition.maxLength < 1) {
        errors.push(`Field ${registryKey}.${definition.key} needs maxLength`);
      }
      if (definition.required && definition.nullable) {
        errors.push(`Required field ${registryKey}.${definition.key} is nullable`);
      }
    }

    const slotKeys = new Set();
    for (const slot of template.mediaSlots) {
      if (!slot.key || slotKeys.has(slot.key)) {
        errors.push(`Template ${registryKey} has an invalid media slot key`);
      }
      slotKeys.add(slot.key);
      if (
        !Array.isArray(slot.mediaTypes) ||
        slot.mediaTypes.length === 0 ||
        slot.mediaTypes.some((type) => !MEDIA_TYPES.has(type))
      ) {
        errors.push(`Media slot ${registryKey}.${slot.key} has invalid types`);
      }
      if (typeof slot.multiple !== "boolean" || typeof slot.required !== "boolean") {
        errors.push(`Media slot ${registryKey}.${slot.key} needs boolean flags`);
      }
      if (!Number.isInteger(slot.maxItems) || slot.maxItems < 1) {
        errors.push(`Media slot ${registryKey}.${slot.key} needs maxItems`);
      }
      if (!slot.multiple && slot.maxItems !== 1) {
        errors.push(`Single media slot ${registryKey}.${slot.key} must allow one item`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
};

export const assertRegistryIntegrity = () => {
  const result = validateRegistryIntegrity(definitions);
  if (!result.ok) {
    throw new Error(`Invalid section template registry: ${result.errors.join("; ")}`);
  }
  return true;
};

assertRegistryIntegrity();
const SECTION_TEMPLATES = deepFreeze(definitions);

export const listSectionTemplates = () => Object.values(SECTION_TEMPLATES);

export const hasSectionTemplate = (templateKey) =>
  Object.hasOwn(SECTION_TEMPLATES, templateKey);

export const getSectionTemplate = (templateKey) =>
  hasSectionTemplate(templateKey) ? SECTION_TEMPLATES[templateKey] : null;

export const getTemplateField = (templateKey, fieldKey) =>
  getSectionTemplate(templateKey)?.fields.find(({ key }) => key === fieldKey) ||
  null;

export const getTemplateMediaSlot = (templateKey, slotKey) =>
  getSectionTemplate(templateKey)?.mediaSlots.find(
    ({ key }) => key === slotKey,
  ) || null;

export const getAdminEditingMetadata = (templateKey = null) => {
  const serialize = (template) => ({
    key: template.key,
    fields: template.fields.map((definition) => ({ ...definition })),
    mediaSlots: template.mediaSlots.map((slot) => ({
      ...slot,
      mediaTypes: [...slot.mediaTypes],
    })),
  });

  if (templateKey !== null) {
    const template = getSectionTemplate(templateKey);
    return template ? serialize(template) : null;
  }

  return listSectionTemplates().map(serialize);
};

export default SECTION_TEMPLATES;
