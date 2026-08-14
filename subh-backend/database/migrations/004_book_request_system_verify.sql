-- Read-only verification for 004_book_request_system.sql
-- Run this AFTER the migration succeeds.

-- 1. Confirm all request-domain tables exist.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'company_profiles',
      'book_requests',
      'book_request_items',
      'request_payments',
      'request_status_history',
      'request_contact_history'
  )
ORDER BY table_name;

-- Expected: 6 rows.


-- 2. Inspect columns/types/defaults/nullability.
SELECT
    table_name,
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
      'company_profiles',
      'book_requests',
      'book_request_items',
      'request_payments',
      'request_status_history',
      'request_contact_history'
  )
ORDER BY table_name, ordinal_position;


-- 3. Inspect foreign keys and delete behavior.
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.constraint_schema = kcu.constraint_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.constraint_schema = tc.constraint_schema
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name
 AND rc.constraint_schema = tc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
      'company_profiles',
      'book_requests',
      'book_request_items',
      'request_payments',
      'request_status_history',
      'request_contact_history'
  )
ORDER BY tc.table_name, tc.constraint_name;


-- 4. Inspect CHECK/UNIQUE/PK/FK constraints.
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid IN (
      'company_profiles'::regclass,
      'book_requests'::regclass,
      'book_request_items'::regclass,
      'request_payments'::regclass,
      'request_status_history'::regclass,
      'request_contact_history'::regclass
  )
ORDER BY conrelid::regclass::text, conname;


-- 5. Inspect indexes.
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
      'company_profiles',
      'book_requests',
      'book_request_items',
      'request_payments',
      'request_status_history',
      'request_contact_history'
  )
ORDER BY tablename, indexname;


-- 6. Confirm triggers.
SELECT
    event_object_table AS table_name,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
      'company_profiles',
      'book_requests',
      'book_request_items'
  )
ORDER BY event_object_table, trigger_name;


-- 7. Confirm the two helper functions exist.
SELECT
    p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'set_book_request_reference',
      'set_book_request_updated_at'
  )
ORDER BY p.proname;


-- 8. Confirm no data was inserted by the migration.
SELECT 'company_profiles' AS table_name, COUNT(*) AS row_count FROM company_profiles
UNION ALL
SELECT 'book_requests', COUNT(*) FROM book_requests
UNION ALL
SELECT 'book_request_items', COUNT(*) FROM book_request_items
UNION ALL
SELECT 'request_payments', COUNT(*) FROM request_payments
UNION ALL
SELECT 'request_status_history', COUNT(*) FROM request_status_history
UNION ALL
SELECT 'request_contact_history', COUNT(*) FROM request_contact_history
ORDER BY table_name;


-- 9. Confirm the derived payment summary view exists.
SELECT
    table_name AS view_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'book_request_payment_summary';

-- Expected: 1 row.


-- 10. The payment summary view should initially be empty because no request data was inserted.
SELECT *
FROM book_request_payment_summary
ORDER BY request_id;
