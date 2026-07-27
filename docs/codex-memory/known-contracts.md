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
