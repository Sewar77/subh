# Users reference

## Current repository evidence

The application currently uses a legacy `public.users` table with these semantics from the backend code:

- `name` is used as the display/user name.
- `email` is used for login and uniqueness checks.
- `hashed_password` stores the bcrypt hash.
- `role` is used for authorization.
- `user_type` is used as a business classification field.
- `phoneNumber` is a legacy phone field name that is serialized to `phone_number` in the user serializer.

## Target user-account shape

The database should support the following normalized shape:

- `id` — primary key
- `full_name` — required display name
- `email` — required normalized email
- `phone_number` — text field for contact number
- `hashed_password` — required password hash
- `role` — default `user`, allowed values `user` and `admin`
- `user_type` — business classification; actual repository values observed in the frontend are `individual` and `company`
- `is_active` — account activation status
- `email_verified` — email verification status
- `created_at` — timezone-aware timestamp
- `updated_at` — timezone-aware timestamp tracked on update

## Role vs user type

- `role` controls authorization semantics.
- `user_type` describes the business classification of the user and is not an authorization flag.

## Account activation and deactivation

- `is_active` should be `TRUE` for enabled accounts and `FALSE` for disabled accounts.
- A deactivated account is not deleted and remains recoverable.

## Email normalization

- Email should be stored in lowercase form.
- The migration uses a unique lowercase index to support normalized email comparison safely.

## Password hashing

- Passwords are hashed using the repository’s existing `bcryptjs` dependency.
- The application stores the resulting hash in `hashed_password`.
- The seed mechanism uses environment variables and never prints the password values.

## Timestamp behavior

- `created_at` is set when the record is created.
- `updated_at` is refreshed by an update trigger.
- The migration uses `TIMESTAMPTZ` for timezone-aware timestamps.

## Migration order

1. `001_user_account_alignment.sql`
2. `002_user_updated_at_trigger.sql`

## How to inspect the migrations

Open the SQL files in the `database/migrations` directory and review them in order before applying them to a target database.

## How to apply migrations later

Use the project-local migration runner, but only after manual verification against a target database:

```bash
DATABASE_URL=... node database/migrations/run-migrations.js
```

## How to run seeds safely

The seed runner is development-only:

```bash
NODE_ENV=development \
DATABASE_URL=... \
SUBH_SEED_USER_PASSWORD=... \
SUBH_SEED_ADMIN_PASSWORD=... \
node database/seeds/dev-users-seed.js
```

Do not run the seed in production.

## Backup requirements

Before any migration is applied to a real database, take a fresh backup of the database and confirm that the target database already contains the legacy `users` table shape expected by the code.

## Legacy schema warning

The repository’s existing `schema.sql` is a legacy and unsafe initialization artifact for this task. It must not be executed for migration or bootstrap purposes because it is not a safe, additive, versioned migration path and it is not the control mechanism for this user-domain change.
