const FIELD_TYPES = new Set([
  "text",
  "textarea",
  "url",
  "boolean",
  "integer",
  "decimal",
]);
const MEDIA_TYPES = new Set(["image", "video", "file"]);
const APPEARANCE_TYPES = new Set(["select"]);
const APPEARANCE_STORAGE_PREFIX = "appearance";

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

const appearanceControl = (key, label, values) => ({
  key,
  label,
  type: "select",
  values,
});

const definitions = {
  hero: {
    key: "hero",
    name: "Hero",
    description: "Prominent page introduction with optional background media and action.",
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
    appearance: [
      appearanceControl("variant", "Variant", ["centered", "split", "minimal"]),
      appearanceControl("height", "Height", ["compact", "standard", "large"]),
      appearanceControl("contentWidth", "Content width", ["narrow", "standard", "wide"]),
      appearanceControl("alignment", "Alignment", ["left", "center", "right"]),
    ],
  },
  image: {
    key: "image",
    name: "Image",
    description: "Standalone image section with controlled sizing and placement.",
    component: "ImageSection",
    fields: [],
    mediaSlots: [mediaSlot("image", ["image"], { required: true })],
    appearance: [
      appearanceControl("variant", "Variant", ["standard", "framed", "full_width"]),
      appearanceControl("imageFit", "Image fit", ["cover", "contain"]),
      appearanceControl("imagePosition", "Image position", ["left", "center", "right"]),
      appearanceControl("height", "Height", ["compact", "standard", "large"]),
    ],
  },
  text: {
    key: "text",
    name: "Text",
    description: "Long-form or highlighted text content.",
    component: "TextSection",
    fields: [
      field("title", "text", { maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 5000 }),
    ],
    mediaSlots: [],
    appearance: [
      appearanceControl("variant", "Variant", ["article", "centered", "highlight"]),
      appearanceControl("contentWidth", "Content width", ["narrow", "standard", "wide"]),
      appearanceControl("alignment", "Alignment", ["left", "center", "right"]),
    ],
  },
  media: {
    key: "media",
    name: "Media gallery",
    description: "A bounded collection of registered media items.",
    component: "MediaSection",
    fields: [field("title", "text", { maxLength: 160 })],
    mediaSlots: [
      mediaSlot("media", ["image"], {
        multiple: true,
        maxItems: 10,
      }),
    ],
    appearance: [
      appearanceControl("variant", "Variant", ["grid", "carousel", "stack"]),
      appearanceControl("spacing", "Spacing", ["compact", "standard", "relaxed"]),
      appearanceControl("imageFit", "Image fit", ["cover", "contain"]),
    ],
  },
  image_text: {
    key: "image_text",
    name: "Image and text",
    description: "Image followed by structured text content.",
    component: "ImageTextSection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 2000 }),
    ],
    mediaSlots: [mediaSlot("image", ["image"], { required: true })],
    appearance: [
      appearanceControl("variant", "Variant", ["standard", "card", "overlap"]),
      appearanceControl("imageFit", "Image fit", ["cover", "contain"]),
      appearanceControl("verticalAlignment", "Vertical alignment", ["top", "center", "bottom"]),
      appearanceControl("spacing", "Spacing", ["compact", "standard", "relaxed"]),
    ],
  },
  text_image: {
    key: "text_image",
    name: "Text and image",
    description: "Structured text followed by an image.",
    component: "ImageTextSection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 2000 }),
    ],
    mediaSlots: [mediaSlot("image", ["image"], { required: true })],
    appearance: [
      appearanceControl("variant", "Variant", ["standard", "card", "overlap"]),
      appearanceControl("imageFit", "Image fit", ["cover", "contain"]),
      appearanceControl("verticalAlignment", "Vertical alignment", ["top", "center", "bottom"]),
      appearanceControl("spacing", "Spacing", ["compact", "standard", "relaxed"]),
    ],
  },
  banner: {
    key: "banner",
    name: "Banner",
    description: "Compact call-to-action or announcement content.",
    component: "BannerSection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { maxLength: 300 }),
    ],
    mediaSlots: [],
    appearance: [
      appearanceControl("variant", "Variant", ["cta", "announcement", "image"]),
      appearanceControl("height", "Height", ["compact", "standard"]),
      appearanceControl("alignment", "Alignment", ["left", "center", "right"]),
    ],
  },
  summary: {
    key: "summary",
    name: "Summary",
    description: "Concise summary or highlighted concluding content.",
    component: "SummarySection",
    fields: [
      field("title", "text", { required: true, maxLength: 160 }),
      field("text", "textarea", { required: true, maxLength: 800 }),
    ],
    mediaSlots: [],
    appearance: [
      appearanceControl("variant", "Variant", ["standard", "highlight", "card"]),
      appearanceControl("contentWidth", "Content width", ["narrow", "standard", "wide"]),
      appearanceControl("alignment", "Alignment", ["left", "center", "right"]),
    ],
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

    if (
      !Array.isArray(template.fields) ||
      !Array.isArray(template.mediaSlots) ||
      !Array.isArray(template.appearance)
    ) {
      errors.push(`Template ${registryKey} must define fields, mediaSlots, and appearance`);
      continue;
    }
    if (!template.name || !template.description) {
      errors.push(`Template ${registryKey} needs safe display metadata`);
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

    const appearanceKeys = new Set();
    for (const control of template.appearance) {
      if (!control.key || appearanceKeys.has(control.key)) {
        errors.push(`Template ${registryKey} has an invalid appearance key`);
      }
      appearanceKeys.add(control.key);
      if (!control.label || !APPEARANCE_TYPES.has(control.type)) {
        errors.push(`Appearance ${registryKey}.${control.key} has invalid metadata`);
      }
      if (
        !Array.isArray(control.values) ||
        control.values.length === 0 ||
        new Set(control.values).size !== control.values.length
      ) {
        errors.push(`Appearance ${registryKey}.${control.key} needs unique values`);
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

export const getTemplateAppearanceControl = (templateKey, appearanceKey) =>
  getSectionTemplate(templateKey)?.appearance.find(
    ({ key }) => key === appearanceKey,
  ) || null;

export const getAppearanceStorageKey = (appearanceKey) =>
  `${APPEARANCE_STORAGE_PREFIX}${appearanceKey.charAt(0).toUpperCase()}${appearanceKey.slice(1)}`;

export const getAppearanceKeyFromStorageKey = (storageKey) => {
  if (!storageKey?.startsWith(APPEARANCE_STORAGE_PREFIX)) return null;
  const suffix = storageKey.slice(APPEARANCE_STORAGE_PREFIX.length);
  return suffix ? `${suffix.charAt(0).toLowerCase()}${suffix.slice(1)}` : null;
};

export const getAdminEditingMetadata = (templateKey = null) => {
  const serialize = (template) => ({
    key: template.key,
    name: template.name,
    description: template.description,
    fields: template.fields.map((definition) => ({ ...definition })),
    mediaSlots: template.mediaSlots.map((slot) => ({
      ...slot,
      mediaTypes: [...slot.mediaTypes],
    })),
    appearance: template.appearance.map((control) => ({
      ...control,
      values: [...control.values],
    })),
    variants: [
      ...(template.appearance.find(({ key }) => key === "variant")?.values || []),
    ],
  });

  if (templateKey !== null) {
    const template = getSectionTemplate(templateKey);
    return template ? serialize(template) : null;
  }

  return listSectionTemplates().map(serialize);
};

export default SECTION_TEMPLATES;
