-- Media Library V1 verification.
-- Read-only: this file does not modify data.

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'media_assets';

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'media_assets'
ORDER BY ordinal_position;

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'media_assets'
ORDER BY indexname;

SELECT
    conname,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.media_assets'::regclass
ORDER BY conname;
