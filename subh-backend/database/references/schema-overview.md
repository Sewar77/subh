# Schema overview for user/account migration

## Repository evidence

The backend code in the repository still uses:

- `name` in the legacy user registration and lookup queries
- `email` as the normalized identity field
- `hashed_password` as the password hash store
- `role` and `user_type` as separate fields
- `phoneNumber` in the SQL model layer, while the serializer exposes `phone_number`

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

The migration adds a lowercase email uniqueness check and role/type membership checks as non-invalidating checks, which means they are documented and can be reviewed manually before being fully enforced by the team.

## Seed behavior

Development seed support is available through the `database/seeds` directory. It uses fake local data and environment-provided passwords, and it refuses to run in production.

## Legacy `schema.sql` note

The existing `schema.sql` in the backend root is marked as legacy/unsafe for this task and must not be executed inside the project workflow.
