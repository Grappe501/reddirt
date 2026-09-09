CREATE TABLE IF NOT EXISTS "public"."decision_simulation_ensemble" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT,
  "requested_runs" INTEGER NOT NULL,
  "completed_runs" INTEGER NOT NULL DEFAULT 0,
  "failed_runs" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "execution_mode" TEXT NOT NULL DEFAULT 'QUEUED',
  "max_concurrency" INTEGER NOT NULL DEFAULT 20,
  "chunk_size" INTEGER NOT NULL DEFAULT 100,
  "retain_individual_runs" BOOLEAN NOT NULL DEFAULT TRUE,
  "input_snapshot" JSONB NOT NULL,
  "model_name" TEXT,
  "prompt_version" TEXT,
  "doctrine_version" TEXT NOT NULL,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  CONSTRAINT "decision_simulation_ensemble_requested_runs_check" CHECK ("requested_runs" BETWEEN 1 AND 1000000),
  CONSTRAINT "decision_simulation_ensemble_completed_runs_check" CHECK ("completed_runs" >= 0 AND "completed_runs" <= "requested_runs"),
  CONSTRAINT "decision_simulation_ensemble_failed_runs_check" CHECK ("failed_runs" >= 0 AND "failed_runs" <= "requested_runs"),
  CONSTRAINT "decision_simulation_ensemble_concurrency_check" CHECK ("max_concurrency" BETWEEN 1 AND 10000),
  CONSTRAINT "decision_simulation_ensemble_chunk_check" CHECK ("chunk_size" BETWEEN 1 AND 10000)
);

CREATE TABLE IF NOT EXISTS "public"."decision_simulation_ensemble_member" (
  "id" TEXT PRIMARY KEY,
  "ensemble_id" TEXT NOT NULL,
  "ordinal" INTEGER NOT NULL,
  "simulation_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "seed" TEXT,
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "error_code" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  CONSTRAINT "decision_simulation_ensemble_member_ensemble_fk" FOREIGN KEY ("ensemble_id") REFERENCES "public"."decision_simulation_ensemble"("id") ON DELETE CASCADE,
  CONSTRAINT "decision_simulation_ensemble_member_simulation_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."decision_simulation_run"("id") ON DELETE SET NULL,
  CONSTRAINT "decision_simulation_ensemble_member_ordinal_unique" UNIQUE ("ensemble_id", "ordinal")
);

CREATE TABLE IF NOT EXISTS "public"."decision_simulation_ensemble_aggregate" (
  "id" TEXT PRIMARY KEY,
  "ensemble_id" TEXT NOT NULL UNIQUE,
  "summary" JSONB NOT NULL,
  "dominant_frames" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "dominant_recommendations" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "threat_distribution" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "opportunity_distribution" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "confidence_mean" DOUBLE PRECISION,
  "probability_mean" DOUBLE PRECISION,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "decision_simulation_ensemble_aggregate_ensemble_fk" FOREIGN KEY ("ensemble_id") REFERENCES "public"."decision_simulation_ensemble"("id") ON DELETE CASCADE,
  CONSTRAINT "decision_simulation_ensemble_confidence_check" CHECK ("confidence_mean" IS NULL OR "confidence_mean" BETWEEN 0 AND 1),
  CONSTRAINT "decision_simulation_ensemble_probability_check" CHECK ("probability_mean" IS NULL OR "probability_mean" BETWEEN 0 AND 1)
);

CREATE INDEX IF NOT EXISTS "decision_simulation_ensemble_status_idx"
  ON "public"."decision_simulation_ensemble" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "decision_simulation_ensemble_member_queue_idx"
  ON "public"."decision_simulation_ensemble_member" ("ensemble_id", "status", "ordinal");
