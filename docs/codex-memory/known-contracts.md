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

## Books navigation and access

- Status: Active
- Scope: Books and administration
- Decision: Active admin pages use the shared Back control. Public books use responsive cards and dedicated public/admin details pages; book mutations remain administrator-only.
- Reason: Books need consistent public reading and safe administration flows.
- Impact: Category pages link to books and counts use grouped database reads; public users may list and view books; request actions reuse an existing workflow when one is available; errors remain specific and actionable.

## Public layout and presentation

- Status: Active
- Scope: Public frontend
- Decision: Public routes retain the shared Header and Footer. Public Books and Categories use responsive card layouts, and Book details render every safe canonical field supplied by the API.
- Reason: Public browsing must remain cohesive through direct navigation, nested routes, and responsive breakpoints.
- Impact: Public theme changes preserve the navy, cyan/turquoise, purple/magenta palette while improving hierarchy, spacing, surfaces, and contained primary actions. Administrators see a Dashboard action in the public Header.

## Admin shell navigation

- Status: Active
- Scope: Frontend administration
- Decision: The admin Header includes a Preview site action, and administrators use a dedicated protected profile page that never exposes authentication secrets.
- Reason: Administrators need a safe account overview and a clear path to the public site without leaving the protected shell ambiguous.
- Impact: The desktop sidebar may collapse to icon-only navigation with tooltips; its preference persists locally and mobile navigation remains available in a drawer.
