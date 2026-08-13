

BEGIN;


-- Assumption: the deployed application already has a legacy public.users table.
-- The repository evidence shows columns such as name, email, hashed_password,
-- role, user_type, and an unquoted phoneNumber (stored by PostgreSQL as
-- phonenumber); this migration preserves that table and adds the normalized
-- account fields required by the newer user shape.
--
-- Manual verification required before applying:
--   1. Confirm the existing users table is present in the target database.
--   2. Confirm legacy rows are not missing required account data.
--   3. Confirm there are no unexpected role or user_type values that would be
--      rejected by the role and user_type constraints below.

DO $$
DECLARE
    v_users_exists boolean;
    v_missing_column text;
BEGIN
    SELECT to_regclass('public.users') IS NOT NULL INTO v_users_exists;

    IF NOT v_users_exists THEN
        RAISE EXCEPTION 'public.users was not found. Inspect the target database schema manually before applying this migration.';
    END IF;

    SELECT column_name
    INTO v_missing_column
    FROM (
        VALUES ('name'), ('email'), ('hashed_password'), ('role'), ('user_type')
    ) AS required_columns(column_name)
    WHERE NOT EXISTS (
        SELECT 1
        FROM information_schema.columns AS existing_columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND existing_columns.column_name = required_columns.column_name
    )
    LIMIT 1;

    IF v_missing_column IS NOT NULL THEN
        RAISE EXCEPTION 'public.users is missing legacy column "%". Inspect the target database schema manually before applying this migration.', v_missing_column;
    END IF;
END $$;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN,
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE public.users
SET full_name = COALESCE(full_name, name)
WHERE full_name IS NULL
  AND name IS NOT NULL;

DO $$
BEGIN
    -- The legacy schema used the unquoted identifier phoneNumber, which
    -- PostgreSQL stores as phonenumber. A quoted camel-case variant is handled
    -- separately for databases that were created manually.
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'phonenumber'
    ) THEN
        EXECUTE '
            UPDATE public.users
            SET phone_number = COALESCE(phone_number, phonenumber::TEXT)
            WHERE phone_number IS NULL
              AND phonenumber IS NOT NULL
        ';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'phoneNumber'
    ) THEN
        EXECUTE '
            UPDATE public.users
            SET phone_number = COALESCE(phone_number, "phoneNumber"::TEXT)
            WHERE phone_number IS NULL
              AND "phoneNumber" IS NOT NULL
        ';
    END IF;
END $$;

UPDATE public.users
SET is_active = COALESCE(is_active, TRUE)
WHERE is_active IS NULL;

UPDATE public.users
SET email_verified = COALESCE(email_verified, FALSE)
WHERE email_verified IS NULL;

UPDATE public.users
SET created_at = COALESCE(created_at, NOW())
WHERE created_at IS NULL;

UPDATE public.users
SET updated_at = COALESCE(updated_at, NOW())
WHERE updated_at IS NULL;

DO $$
DECLARE
    v_missing_name_count integer;
    v_missing_email_count integer;
    v_missing_password_count integer;
    v_missing_role_count integer;
    v_invalid_role_count integer;
    v_invalid_user_type_count integer;
BEGIN
    SELECT COUNT(*) INTO v_missing_name_count
    FROM public.users
    WHERE full_name IS NULL OR full_name = '';

    SELECT COUNT(*) INTO v_missing_email_count
    FROM public.users
    WHERE email IS NULL OR email = '';

    SELECT COUNT(*) INTO v_missing_password_count
    FROM public.users
    WHERE hashed_password IS NULL OR hashed_password = '';

    SELECT COUNT(*) INTO v_missing_role_count
    FROM public.users
    WHERE role IS NULL;

    SELECT COUNT(*) INTO v_invalid_role_count
    FROM public.users
    WHERE role IS NOT NULL
      AND role NOT IN ('user', 'admin');

    SELECT COUNT(*) INTO v_invalid_user_type_count
    FROM public.users
    WHERE user_type IS NOT NULL
      AND user_type NOT IN ('individual', 'company');

    IF v_missing_name_count > 0 THEN
        RAISE EXCEPTION 'One or more users are missing full_name. Inspect legacy rows before enforcing the required user-name shape.';
    END IF;

    IF v_missing_email_count > 0 THEN
        RAISE EXCEPTION 'One or more users are missing email. Inspect legacy rows before enforcing the required normalized email field.';
    END IF;

    IF v_missing_password_count > 0 THEN
        RAISE EXCEPTION 'One or more users are missing hashed_password. Inspect legacy rows before enforcing the required password-hash shape.';
    END IF;

    IF v_missing_role_count > 0 OR v_invalid_role_count > 0 THEN
        RAISE EXCEPTION 'One or more users have a missing or unsupported role. Resolve legacy data before enforcing user/admin roles.';
    END IF;

    IF v_invalid_user_type_count > 0 THEN
        RAISE EXCEPTION 'One or more users have an unsupported user_type. Resolve legacy data before enforcing individual/company user types.';
    END IF;
END $$;

ALTER TABLE public.users
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN hashed_password SET NOT NULL,
    ALTER COLUMN role SET DEFAULT 'user',
    ALTER COLUMN role SET NOT NULL,
    ALTER COLUMN is_active SET DEFAULT TRUE,
    ALTER COLUMN email_verified SET DEFAULT FALSE,
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.users
    ALTER COLUMN phone_number TYPE TEXT USING phone_number::TEXT;

DO $$
DECLARE
    v_invalid_column text;
BEGIN
    SELECT column_name
    INTO v_invalid_column
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND (
          (column_name IN ('is_active', 'email_verified') AND data_type <> 'boolean')
          OR (column_name IN ('created_at', 'updated_at') AND data_type <> 'timestamp with time zone')
      )
    LIMIT 1;

    IF v_invalid_column IS NOT NULL THEN
        RAISE EXCEPTION 'public.users.% has an incompatible type. Inspect the target schema and choose an explicit data-preserving conversion before applying this migration.', v_invalid_column;
    END IF;
END $$;

ALTER TABLE public.users
    ADD CONSTRAINT users_role_allowed_chk
    CHECK (role IN ('user', 'admin'));

ALTER TABLE public.users
    ADD CONSTRAINT users_user_type_allowed_chk
    CHECK (user_type IN ('individual', 'company'));

ALTER TABLE public.users
    ADD CONSTRAINT users_email_normalized_chk
    CHECK (email = LOWER(BTRIM(email))) NOT VALID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_users_email_lower_unique'
    ) THEN
        EXECUTE 'CREATE UNIQUE INDEX idx_users_email_lower_unique ON public.users ((LOWER(BTRIM(email))))';
    END IF;
END $$;

COMMIT;
