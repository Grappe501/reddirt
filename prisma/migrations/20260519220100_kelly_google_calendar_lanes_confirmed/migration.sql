-- Kelly Google Calendar V2 — confirmed lane enum value (separate migration for PG enum safety).

ALTER TYPE "CalendarSourceType" ADD VALUE 'KELLY_GOOGLE_CONFIRMED';
