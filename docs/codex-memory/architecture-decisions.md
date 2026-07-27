# Architecture Decisions

## Structured CMS ownership

- Status: Active
- Scope: CMS
- Decision: The CMS is a structured content editor, not a page builder. Developers own fixed pages, section templates, component selection, layouts, validation definitions, and media-slot definitions.
- Reason: The backend registry fixes the supported content structure.
- Impact: Administrator interfaces must not offer arbitrary pages, section types, template changes, JSX, CSS, or layout editing.

## Fixed page and section instances

- Status: Active
- Scope: CMS
- Decision: Pages and section instances are fixed developer-owned records; administrator actions are limited to allowed content, media, ordering, visibility, and archive/restore state.
- Reason: Public rendering depends on stable page and template identities.
- Impact: CMS changes preserve page keys, routes, section template keys, and component ownership.

## Registry-defined editing schema

- Status: Active
- Scope: CMS
- Decision: The backend section template registry is the source of truth for CMS editable fields, localization, validation metadata, and media slots.
- Reason: Validation and rendering must use one developer-owned contract.
- Impact: Frontend CMS editing uses backend-provided `editingSchema`; it must not duplicate registry validation or permissions.
