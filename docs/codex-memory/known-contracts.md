# Known Contracts

## CMS administrator boundary

- Status: Active
- Scope: CMS
- Decision: Administrators manage section instances on fixed pages: create from registered templates, duplicate, reorder, hide/show, archive/restore, and edit approved bilingual or neutral content, media metadata, controlled appearance, and approved links.
- Reason: CMS content is constrained by fixed templates.
- Impact: Requests and UI controls must derive allowable content fields, media slots, limits, variants, and appearance controls from the backend registry. Pages and template definitions remain immutable.

## CMS editing schema delivery

- Status: Active
- Scope: CMS
- Decision: Administrator section responses provide serializable `editingSchema` metadata with fields and media slots.
- Reason: The administrator editor needs developer-defined metadata without exposing registry mutation APIs.
- Impact: Treat `editingSchema` as read-only and use it to render editable controls.

## Administrator Media Library contract

- Status: Active
- Scope: Backend media assets
- Decision: `/api/admin/media-assets` is an administrator-only, server-paginated registry for Cloudinary-backed JPEG, PNG, and WebP assets. V1 supports upload/register, list/search, detail, safe metadata editing, archive, and restore; it exposes no hard-delete endpoint.
- Reason: Reusable assets must remain available to existing consumers and retain auditable provider and uploader metadata.
- Impact: Uploads reuse the hardened signature, size, temporary-file, rate-limit, and Cloudinary controls. The server owns storage metadata and removes only a newly uploaded Cloudinary asset when its database registration fails.

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
- Impact: Public theme changes preserve the established Subh purple, magenta, navy, and turquoise palette. Administrators see a Dashboard action in the public Header.

## Public localization boundary

- Status: Active
- Scope: Public reads and administrator editing
- Decision: Public localized reads use `?lang=en` or `?lang=ar`, defaulting to English, and return only the requested locale. Public SQL selects only the matching localized columns where practical.
- Reason: Public views need one locale at a time without bilingual payload or query overhead.
- Impact: Public and admin serializers remain separate; administrator CMS and entity editing APIs continue returning bilingual values.

## Public catalog query contract

- Status: Active
- Scope: Public Books and Categories
- Decision: Public book lists and category-book lists share server-side pagination, localized title/category/author search, category and price filters, and validated sorting. Category-book routes force their path category while returning the same pagination metadata.
- Reason: Public catalog controls must search the complete catalog without filtering only the currently loaded page or issuing author N+1 requests.
- Impact: Public list responses include localized author summaries; category discovery may search/sort the complete localized category response client-side, while book filtering and pagination remain server-side.

## Admin shell navigation

- Status: Active
- Scope: Frontend administration
- Decision: The admin Header includes a Preview site action, and administrators use a dedicated protected profile page that never exposes authentication secrets.
- Reason: Administrators need a safe account overview and a clear path to the public site without leaving the protected shell ambiguous.
- Impact: The desktop sidebar may collapse to icon-only navigation with tooltips; its preference persists locally and mobile navigation remains available in a drawer.

## Public CMS rendering contract

- Status: Active
- Scope: Public Home and About CMS rendering
- Decision: Public page sections use the canonical localized shape `id`, `templateKey`, `position`, `content`, and `media`; the renderer maps media slots to registered section components and does not require bilingual translations.
- Reason: `/public/pages/key/:key?lang=en|ar` already localizes content and media on the backend.
- Impact: Unknown template keys fail closed by rendering nothing, public sections stay position-ordered, and narrow legacy translation compatibility must not weaken the CMS registry.

## Cookie-authenticated request boundary

- Status: Active
- Scope: Backend HTTP security
- Decision: Credentialed browser origins come from `CORS_ORIGINS` or `FRONTEND_ORIGIN`; production auth cookies default to Secure, HttpOnly, SameSite=Lax, and cookie-authenticated mutations require a trusted Origin.
- Reason: Cookie authentication requires explicit credentialed-CORS and CSRF boundaries without breaking localhost development.
- Impact: Cross-site production cookies require an explicit `COOKIE_SAME_SITE=none` deployment decision, configured trusted origins, and HTTPS; authentication and upload endpoints remain rate-limited.

## Reusable public catalog presentation

- Status: Active
- Scope: Public Books, Categories, and future listing pages
- Decision: Public listing pages use the shared `PublicPageHero` and compound `CatalogToolbar` controls, with page-specific configuration instead of duplicated page heroes or filter layouts.
- Reason: Books and Categories should share Subh visual rhythm, responsive behavior, accessibility, and RTL handling without coupling reusable UI to one data domain.
- Impact: Catalog strings and localized count formatting remain in `catalogI18n.js`; Books retain server-side filtering/debounce/pagination, Categories retain local discovery filtering, and listing images remain lazy-loaded with deliberate cover behavior.

## Frontend route performance boundary

- Status: Active
- Scope: Public and administrator frontend routes
- Decision: Substantial route elements load with `React.lazy` behind the shared localized `RouteLoading` fallback; the public shell stays eager, while the administrator guard, layout, pages, CMS, and admin-only providers remain outside the initial public route graph.
- Reason: Route-level splitting reduces initial public JavaScript without fragile manual chunk rules or changing route authorization.
- Impact: Keep direct and nested paths covered by route-splitting tests. Scope `PagesProvider` to public/admin layouts and user/category management providers to the admin outlet so unrelated context updates do not rerender the root application.

## Public image loading priority

- Status: Active
- Scope: Public catalog and CMS imagery
- Decision: Listing and below-fold images lazy-load with stable display geometry; primary Book Detail artwork and the first rendered CMS section image load eagerly with high fetch priority.
- Reason: Critical imagery should not be delayed, while below-fold media should not compete with initial content or cause avoidable layout shift.
- Impact: Book covers use a stable `2 / 3` presentation container: list/admin thumbnails use `cover`, while detail views use `contain` to preserve full artwork. Listing and below-fold images lazy-load, primary Book Detail artwork remains eager, category images retain appropriate `cover`, and missing CMS image references must not render broken image requests.

## Company account identity boundary

- Status: Active
- Scope: Registration, authentication, and user profiles
- Decision: A company account remains a normal `users` identity with `role = "user"` and `user_type = "company"`; company-only registration and profile data lives in the one-to-one `company_profiles` record.
- Reason: Account type describes business information and must not create a separate authentication or authorization path.
- Impact: Company registration creates the user and profile atomically. Login, role checks, dashboards, and authorization remain identical to individual users; only safe company profile fields may be added to current-user and administrator user-detail responses.

## Customer Book Request boundary

- Status: Active
- Scope: Core customer Book Request backend
- Decision: Authenticated individual and company users share `/api/book-requests`; creation accepts only book IDs, bulk quantities, shipping data, and a customer note. Duplicate book IDs are rejected and the centralized per-item quantity ceiling is one million.
- Reason: Catalog prices, shipping estimates, identity snapshots, workflow states, totals, and administrative data must remain server-owned.
- Impact: Creation loads and locks all requested books in one query, calculates line estimates in PostgreSQL, sums fixed-decimal values exactly, inserts request/items atomically, and retains database workflow defaults. Customer reads are owner-filtered in SQL, paginate newest-first, and localize the historical item name through `?lang=en|ar` without exposing bilingual snapshots or internal notes.

## Administrator Book Request workflow boundary

- Status: Active
- Scope: Administrator Book Request backend
- Decision: `/api/admin/book-requests` routes require both `protect` and `adminOnly`. Server-filtered list/detail reads may expose management-safe bilingual snapshots, internal notes, assignment, status history, and contact history only to administrators; payment records remain outside this phase.
- Reason: Request management requires privileged operational context while customer ownership, note visibility, and quote confidentiality must remain unchanged.
- Impact: Assignment accepts only active administrators. Request/contact/quote/fulfillment transitions use centralized allowlists and write status history transactionally. Quote preparation covers every item, uses server-calculated fixed-decimal totals, and stays hidden from customers while draft. Contact logging atomically synchronizes contact/follow-up fields and history.

## Administrator Book Request UI boundary

- Status: Active
- Scope: Administrator Book Request frontend
- Decision: `/admin/requests` uses server-driven URL filters and pagination through one `adminBookRequestService`; `/admin/requests/:id` exposes only backend-supported assignment, workflow, quote, notes, and contact operations.
- Reason: Administrative workflow state and monetary totals remain server-owned while the interface stays navigable, reviewable, and responsive.
- Impact: The UI offers only known status transitions, treats live quote totals as a non-authoritative preview, refreshes from mutation responses, keeps payment read-only, and visually separates customer, customer-visible administrator, and internal administrator notes.

## Customer Book Request UI boundary

- Status: Active
- Scope: Customer Book Request frontend
- Decision: Individual and company users share the protected `/request-books`, `/my-requests`, and `/my-requests/:id` flow through one `customerBookRequestService`; read requests always send the active `lang`.
- Reason: A Book Request is a bulk inquiry rather than checkout, and customer-visible state must remain localized, owner-safe, and server-authoritative.
- Impact: Creation sends only book IDs and quantities, supported shipping fields, and an optional customer note. Client estimates are preview-only, duplicate books are prevented, login preserves safe return navigation, and customer detail UI never expects draft quotes, internal notes, contact history, or administrator history.

## Offline Book Request payment boundary

- Status: Active
- Scope: Book Request backend payments
- Decision: Subh never processes cards or online payments. Administrators record offline payments and refunds as append-only `request_payments` ledger entries; incorrect entries are audited as voided and never deleted.
- Reason: Payment credentials must remain outside Subh while balances and workflow state remain exact, reviewable, and concurrency-safe.
- Impact: Currency comes from the request, totals come from `book_request_payment_summary`, and request-row locking serializes record/refund/void operations. Payment status is derived centrally and changes with transactional `payment` status history. Customer detail exposes only a customer-visible summary after the quote is visible; admin detail may expose the full safe ledger and void audit.

## Administrator offline payment UI boundary

- Status: Active
- Scope: Administrator Book Request frontend
- Decision: The existing `/admin/requests/:id` detail page is the only administrator offline-payment workspace. It uses `adminBookRequestService` to record payments, record refunds, and audit-void ledger entries; payment status and all monetary summaries remain read-only backend results.
- Reason: Subh records offline money movement but never processes card credentials, and administrators need one auditable request context rather than a parallel payment module.
- Impact: Entry forms send only allowed payment metadata, payment entry requires an accepted quote or confirmed request in the UI, refund availability reflects backend net paid, and voiding requires a reason through the reusable confirmation modal. Voided records remain visible and every successful mutation refreshes the full request detail.

## Administrator Media Library UI boundary

- Status: Active
- Scope: Administrator Media Library and CMS image selection
- Decision: `/admin/media` and reusable admin image pickers use one `mediaAssetService` with server-side search and pagination. New images upload once to the canonical Media Library; selecting an existing active asset only returns that asset and never uploads it again.
- Reason: Administrators need one reusable image source without duplicating Cloudinary assets or creating CMS-specific libraries.
- Impact: CMS, Book cover/barcode, and Category image forms link only the selected asset URL through their existing domain endpoints. Existing unregistered URLs remain valid and replaceable. CMS continues to own slot limits and media behavior; Book and Category APIs remain unchanged. Archiving hides assets from normal selection without deleting Cloudinary content or breaking existing references.

## Workshop V1 boundary

- Status: Active application contract; persistence must be provisioned separately
- Scope: Workshop categories, presenters, Workshops, sessions, bookings, offline confirmation, attendance, and confirmation email
- Decision: Workshops are independent from Books. Individual and company users share the same authenticated booking flow; one account may hold one active booking per session, and each active booking reserves exactly one seat. Session capacity is enforced in a transaction after locking the session row.
- Reason: Workshop scheduling, eligibility, attendance, and offline confirmation need their own historical records and privacy rules without coupling to Book Requests or trusting client price/status/capacity values.
- Impact: Public reads are localized through `?lang=en|ar`, show only published Workshops and future open sessions, and never expose meeting links or private location instructions. Customer reads are owner-filtered in SQL and reveal delivery details only for confirmed/completed bookings. Only the transactional administrator offline-payment operation may confirm a booking; it writes payment/status/outbox records atomically, then email delivery occurs after commit and may be retried. Workshop images reuse the canonical Media Library URL and `MediaPicker`.

## Analytics V1 boundary

- Status: Active application contract; persistence is provisioned separately
- Scope: First-party traffic, business analytics, customer segmentation, and administrator reporting
- Decision: Analytics events describe traffic and early funnel behavior only. Book Request and Workshop tables remain authoritative for submissions, payments, revenue, balances, capacity, confirmation, and attendance. Browser identity uses random visitor and session UUIDs, sessions rotate after 30 minutes of inactivity, and authenticated `user_id` is derived only by the server.
- Reason: Business reporting must remain auditable without collecting PII in the analytics event store or treating behavioral signals as proof of payment.
- Impact: `/api/analytics/events` accepts only the centralized event allowlist, bounded scalar properties, sanitized paths, and no client user identity. `/api/admin/analytics/*` is administrator-only and uses bounded comparison ranges. A purchasing Book Request has positive canonical `net_paid`, a `partially_paid` or `paid` payment status, and is not cancelled or rejected. Loyal means at least three such requests. Reserved Workshop occupancy includes pending, awaiting-payment, and confirmed bookings; confirmed occupancy includes confirmed and completed bookings. Attendance rate excludes unmarked records from its denominator and reports them separately.
