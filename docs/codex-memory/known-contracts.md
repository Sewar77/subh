# Known Contracts

## CMS administrator boundary

- Status: Active
- Scope: CMS
- Decision: Administrators edit approved bilingual and neutral content, media and metadata, section position, visibility, archive state, restore state, and approved links only.
- Reason: CMS content is constrained by fixed templates.
- Impact: Requests and UI controls must derive allowable fields and media slots from the backend registry rather than client-selected templates.

## CMS editing schema delivery

- Status: Active
- Scope: CMS
- Decision: Administrator section responses provide serializable `editingSchema` metadata with fields and media slots.
- Reason: The administrator editor needs developer-defined metadata without exposing registry mutation APIs.
- Impact: Treat `editingSchema` as read-only and use it to render editable controls.

## Durable memory precedence

- Status: Active
- Scope: Workflow
- Decision: `AGENTS.md` is primary; current user instructions and current repository code override stale Codex memory.
- Reason: Documentation can become outdated while source and task authority remain current.
- Impact: Update or mark obsolete any memory note contradicted by current code or instructions.

## Categories boundary

- Status: Active
- Scope: Categories
- Decision: Category names are required, unique bilingual values; bilingual descriptions are nullable; category images use the existing Cloudinary integration.
- Reason: Categories are public read content with administrator-managed metadata.
- Impact: Public users may read categories, only administrators may create, edit, or delete them, and database and migration ownership remains outside Codex.

## Admin management UI

- Status: Active
- Scope: Frontend administration
- Decision: Destructive actions use the reusable confirmation modal, never browser alerts or confirms. Management tables are responsive, start with a displayed row number, truncate long text, and provide View Details actions.
- Reason: Administrative actions need safe, consistent behavior across screen sizes.
- Impact: Create forms use Upload/Add image while existing-image edits may use Replace image; Arabic fields may contain English text with a non-blocking recommendation; errors must be specific and user-actionable; frontend work prioritizes consistent UX and practical performance.

## Admin design and accessibility

- Status: Active
- Scope: Frontend administration
- Decision: Admin typography is slightly enlarged and pages provide concise contextual instructions. Entity details use dedicated protected pages rather than modals; details include suitable management actions.
- Reason: Administrative work must remain readable and understandable during long sessions and on smaller screens.
- Impact: Table actions use accessible icons and tooltips; prominent primary-theme headers and theme-aware row hovers follow the Subh navy, cyan/turquoise, purple/magenta, and restrained-gradient visual direction. Responsive, accessible behavior is required.
