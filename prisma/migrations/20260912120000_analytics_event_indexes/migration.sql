CREATE INDEX IF NOT EXISTS "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent" ("name", "createdAt");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_path_createdAt_idx" ON "AnalyticsEvent" ("path", "createdAt");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_sessionId_createdAt_idx" ON "AnalyticsEvent" ("sessionId", "createdAt");
