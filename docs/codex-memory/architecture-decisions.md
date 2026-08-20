# Architecture Decisions

## Structured CMS ownership

- Status: Active
- Scope: CMS
- Decision: The CMS is a constrained section-instance builder for fixed system pages. Developers own page identities, registered section templates, component selection, validation definitions, media slots, and appearance allowlists; administrators create and manage instances of those templates.
- Reason: The backend registry fixes the supported content structure.
- Impact: Administrator interfaces may add, duplicate, reorder, hide/show, archive/restore, and edit registered section instances, but must not offer arbitrary pages, template definitions, JSX, CSS, or unregistered layout controls.

## Fixed pages and administrator-managed section instances

- Status: Active
- Scope: CMS
- Decision: Pages are fixed developer-owned records. Section instances are administrator-managed records constrained to the immutable developer registry and existing pages.
- Reason: Public rendering depends on stable page and template identities.
- Impact: CMS changes preserve page keys, routes, registered template keys, and component ownership while allowing transactional section creation, duplication, contiguous ordering, visibility, archive/restore, content, media-reference, and controlled appearance changes.

## Registry-defined editing schema

- Status: Active
- Scope: CMS
- Decision: The backend section template registry is the source of truth for CMS editable fields, localization, validation metadata, and media slots.
- Reason: Validation and rendering must use one developer-owned contract.
- Impact: Frontend CMS editing uses backend-provided `editingSchema`; it must not duplicate registry validation or permissions.

## Global Media Library ownership

- Status: Active
- Scope: Administrator media management
- Decision: Cloudinary owns physical image storage while `media_assets` is the canonical reusable asset registry. Administrators upload and register assets once, edit safe reusable metadata, and archive or restore records without hard deletion.
- Reason: CMS, Books, and Categories need stable reusable asset identities without repeated uploads or unsafe provider deletion.
- Impact: New uploads always use `source = uploaded`; provider URLs, public IDs, dimensions, byte counts, format, uploader, source, timestamps, and archive state remain server-owned. Future feature integrations select registered asset URLs rather than creating parallel upload registries.
