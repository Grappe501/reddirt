-- Additive queue fields + chunk table for Decision Simulator workers.
-- Does not drop or rewrite existing ensemble rows.

ALTER TABLE "public"."decision_simulation_ensemble"
  ADD COLUMN IF NOT EXISTS "chunk_count" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "next_chunk_ordinal" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "actor_model_version" TEXT,
  ADD COLUMN IF NOT EXISTS "job_seed" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "error_summary" TEXT,
  ADD COLUMN IF NOT EXISTS "input_tokens" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "output_tokens" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "estimated_cost_usd" DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS "public"."decision_simulation_ensemble_chunk" (
  "id" TEXT PRIMARY KEY,
  "ensemble_id" TEXT NOT NULL,
  "chunk_ordinal" INTEGER NOT NULL,
  "start_run_ordinal" INTEGER NOT NULL,
  "end_run_ordinal" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "completed_runs" INTEGER NOT NULL DEFAULT 0,
  "failed_runs" INTEGER NOT NULL DEFAULT 0,
  "claimed_at" TIMESTAMPTZ,
  "claimed_by" TEXT,
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "error" TEXT,
  "input_tokens" INTEGER NOT NULL DEFAULT 0,
  "output_tokens" INTEGER NOT NULL DEFAULT 0,
  "result_snapshot" JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT "decision_simulation_ensemble_chunk_ensemble_fk"
    FOREIGN KEY ("ensemble_id") REFERENCES "public"."decision_simulation_ensemble"("id") ON DELETE CASCADE,
  CONSTRAINT "decision_simulation_ensemble_chunk_ordinal_unique" UNIQUE ("ensemble_id", "chunk_ordinal"),
  CONSTRAINT "decision_simulation_ensemble_chunk_range_check" CHECK ("end_run_ordinal" >= "start_run_ordinal")
);

CREATE INDEX IF NOT EXISTS "decision_simulation_ensemble_chunk_queue_idx"
  ON "public"."decision_simulation_ensemble_chunk" ("ensemble_id", "status", "chunk_ordinal");
