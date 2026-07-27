# Database directory

This directory contains additive database artifacts for accounts and the CMS.

## Structure

- `migrations/` — additive, versioned SQL migration files
- `seeds/` — development-only seed support
- `references/` — documentation for the legacy and target user schema
- `README.md` — this file

## Migration order

Review and apply migrations in the following order:

1. `001_user_account_alignment.sql`
2. `002_user_updated_at_trigger.sql`
3. `003_structured_section_content.sql`

## Important warnings

- Do not execute the legacy `schema.sql` file.
- Do not apply migrations against the configured database from this task.
- Do not use destructive SQL.
- Preserve existing user rows and password hashes.
- Preserve legacy section translations and media; see `references/cms.md` for
  the optional backfill strategy.

## Safe seed usage

Development seeds must only be run with explicit environment variables and must not run automatically during normal application startup.

## Manual verification before apply

Before applying migrations to a real database, verify:

- the target database already contains the legacy `users` table
- `name`, `email`, `hashed_password`, `role`, `user_type`, and the phone column values are as expected
- any role or user_type values are consistent with the repository evidence
- backups are in place
