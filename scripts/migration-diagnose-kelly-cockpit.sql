-- Read-only: Kelly cockpit failed migration diagnostics (20260518210000_kelly_calendar_cockpit)
-- Do not commit credentials; run via: npx prisma db execute --file scripts/migration-diagnose-kelly-cockpit.sql

SELECT
  id,
  migration_name,
  started_at,
  finished_at,
  rolled_back_at,
  applied_steps_count,
  logs
FROM "_prisma_migrations"
WHERE migration_name = '20260518210000_kelly_calendar_cockpit';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'KellyCalendarDecision',
    'LocalCoverageRequest',
    'CalendarAlert',
    'KellyCalendarPromotion'
  )
ORDER BY table_name;

SELECT typname AS enum_type
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typname IN (
    'KellyCockpitDecisionKind',
    'KellySurrogateTypePref',
    'LocalCoverageRequestStatus',
    'CalendarAlertSeverity',
    'CalendarAlertChannel',
    'CalendarAlertStatus'
  )
ORDER BY typname;

-- Kelly Google lane enum values (later migrations); safe read-only
SELECT e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname = 'CalendarSourceType'
  AND e.enumlabel IN ('KELLY_GOOGLE_TENTATIVE', 'KELLY_GOOGLE_CONFIRMED')
ORDER BY e.enumsortorder;
