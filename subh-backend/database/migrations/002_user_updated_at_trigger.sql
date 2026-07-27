BEGIN;

-- This trigger keeps updated_at current whenever a user row is updated.
-- It is additive and intentionally limited to the user/account domain.
-- The function name is intentionally generic so it can be reused safely.

CREATE OR REPLACE FUNCTION public.set_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_users_set_updated_at'
          AND tgrelid = 'public.users'::regclass
    ) THEN
        CREATE TRIGGER trg_users_set_updated_at
        BEFORE UPDATE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION public.set_users_updated_at();
    END IF;
END $$;

COMMIT;
