# Structured CMS storage

Migration `003_structured_section_content.sql` adds generic field and media-item
storage without removing the legacy `section_translations` or `section_media`
structures. No mandatory backfill is required: reads use generic
`section_content` records when any exist for a section and otherwise fall back
to legacy translations.

If legacy content is backfilled later, migrate one section atomically and copy
all of that section's localized fields before inserting its first generic row.
This avoids switching read precedence while only part of a section has moved.
Media URLs embedded in legacy JSON should be assigned to the fixed slot from
`src/cms/sectionTemplateRegistry.js`; do not infer new slot or template keys.

The compatibility update endpoint performs that per-section bootstrap before
its first structured write. It recognizes the historical `content`/`subtitle`
text aliases and embedded media aliases, but rejects other unregistered fields
instead of silently discarding them. Because generic file references are not
localized, bootstrap deterministically prefers the English legacy media URL,
then Arabic, when both exist. Review such sections manually after migration.
