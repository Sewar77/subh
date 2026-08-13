# Schema overview for user/account migration

## Repository evidence

The legacy user table used:

- `name` in the legacy user registration and lookup queries
- `email` as the normalized identity field
- `hashed_password` as the password hash store
- `role` and `user_type` as separate fields
- unquoted `phoneNumber` (stored by PostgreSQL as `phonenumber`) in the SQL model layer

The current account backend expects the target names `full_name` and
`phone_number`. Migration 001 bridges the legacy names additively and leaves
legacy columns in place.

The frontend admin UI shows that the live business user types are:

- `individual`
- `company`

The role choices visible in the frontend are:

- `user`
- `admin`

## Important distinction

This migration keeps `role` and `user_type` separate because they are not interchangeable:

- `role` is authorization-related.
- `user_type` is business classification only.

## Safety design

The migration deliberately avoids:

- `DROP TABLE`
- `DROP DATABASE`
- `TRUNCATE`
- destructive column removal

It instead performs additive column changes and safe data backfills.

## Constraint notes

The migration aborts before adding role/type constraints if existing data has
unsupported values. It does not silently coerce roles or business user types.
The normalized-email check is added as `NOT VALID` so existing values are not
rewritten; it is enforced for new and updated rows. The lowercase unique index
will stop the migration if legacy values normalize to a duplicate, requiring
manual resolution first.

## Seed behavior

Development seed support is available through the `database/seeds` directory. It uses fake local data and environment-provided passwords, and it refuses to run in production.

## Legacy `schema.sql` note

The existing `schema.sql` in the backend root is marked as legacy/unsafe for this task and must not be executed inside the project workflow.
