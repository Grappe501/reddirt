-- Decision Simulation Engine — Phase 2 persistence foundation
-- Migration-first and isolated from existing RedDirt campaign tables.
-- No send/post execution is introduced by this migration.

CREATE TABLE "decision_simulation_actor" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "actor_type" TEXT NOT NULL,
  "description" TEXT,
  "known_positions_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "behavioral_patterns_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "source_notes_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "model_version" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_actor_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_actor_slug_key" UNIQUE ("slug"),
  CONSTRAINT "decision_simulation_actor_type_check" CHECK ("actor_type" IN ('PERSON','CAMPAIGN','ORGANIZATION','MEDIA','AUDIENCE','ALLY','CRITIC','OTHER'))
);

CREATE TABLE "decision_simulation_run" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "objective" TEXT,
  "initial_move" TEXT NOT NULL,
  "context_json" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "operator_notes" TEXT,
  "primary_counterpart_actor_id" TEXT,
  "created_by_user_id" TEXT,
  "model_provider" TEXT,
  "model_name" TEXT,
  "prompt_version" TEXT,
  "doctrine_version" TEXT NOT NULL DEFAULT 'decision-simulation-doctrine-1.0',
  "temperature" DOUBLE PRECISION,
  "input_tokens" INTEGER,
  "output_tokens" INTEGER,
  "estimated_cost_usd" DECIMAL(12,6),
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_run_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_run_channel_check" CHECK ("channel" IN ('EMAIL','SOCIAL','TEXT','PRESS','MEMO','SPEECH','DEBATE','FUNDRAISING','INTERNAL','OTHER')),
  CONSTRAINT "decision_simulation_run_status_check" CHECK ("status" IN ('DRAFT','QUEUED','RUNNING','COMPLETE','FAILED','ARCHIVED')),
  CONSTRAINT "decision_simulation_run_actor_fkey" FOREIGN KEY ("primary_counterpart_actor_id") REFERENCES "decision_simulation_actor"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "decision_simulation_move" (
  "id" TEXT NOT NULL,
  "simulation_id" TEXT NOT NULL,
  "parent_move_id" TEXT,
  "ply" INTEGER NOT NULL,
  "side" TEXT NOT NULL,
  "move_kind" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "frame" TEXT,
  "rationale_summary" TEXT,
  "probability" DOUBLE PRECISION,
  "confidence" DOUBLE PRECISION,
  "threat_level" TEXT,
  "opportunity_level" TEXT,
  "is_recommended_path" BOOLEAN NOT NULL DEFAULT FALSE,
  "model_name" TEXT,
  "prompt_version" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_move_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_move_simulation_fkey" FOREIGN KEY ("simulation_id") REFERENCES "decision_simulation_run"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_move_parent_fkey" FOREIGN KEY ("parent_move_id") REFERENCES "decision_simulation_move"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_move_ply_check" CHECK ("ply" >= 0 AND "ply" <= 6),
  CONSTRAINT "decision_simulation_move_side_check" CHECK ("side" IN ('OPERATOR','COUNTERPART')),
  CONSTRAINT "decision_simulation_move_kind_check" CHECK ("move_kind" IN ('INITIAL_MOVE','PREDICTED_RESPONSE','RECOMMENDED_RESPONSE','ACTUAL_RESPONSE')),
  CONSTRAINT "decision_simulation_move_probability_check" CHECK ("probability" IS NULL OR ("probability" >= 0 AND "probability" <= 1)),
  CONSTRAINT "decision_simulation_move_confidence_check" CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1)),
  CONSTRAINT "decision_simulation_move_threat_check" CHECK ("threat_level" IS NULL OR "threat_level" IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  CONSTRAINT "decision_simulation_move_opportunity_check" CHECK ("opportunity_level" IS NULL OR "opportunity_level" IN ('LOW','MEDIUM','HIGH'))
);

CREATE TABLE "decision_simulation_branch" (
  "id" TEXT NOT NULL,
  "simulation_id" TEXT NOT NULL,
  "from_move_id" TEXT NOT NULL,
  "to_move_id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "branch_type" TEXT NOT NULL DEFAULT 'ALTERNATIVE',
  "probability" DOUBLE PRECISION,
  "rank" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_branch_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_branch_simulation_fkey" FOREIGN KEY ("simulation_id") REFERENCES "decision_simulation_run"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_branch_from_fkey" FOREIGN KEY ("from_move_id") REFERENCES "decision_simulation_move"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_branch_to_fkey" FOREIGN KEY ("to_move_id") REFERENCES "decision_simulation_move"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_branch_type_check" CHECK ("branch_type" IN ('EXPECTED','HOSTILE','BEST_CASE','ALTERNATIVE')),
  CONSTRAINT "decision_simulation_branch_probability_check" CHECK ("probability" IS NULL OR ("probability" >= 0 AND "probability" <= 1))
);

CREATE TABLE "decision_simulation_evidence" (
  "id" TEXT NOT NULL,
  "simulation_id" TEXT NOT NULL,
  "move_id" TEXT,
  "actor_id" TEXT,
  "source_type" TEXT NOT NULL,
  "source_ref" TEXT,
  "title" TEXT,
  "excerpt" TEXT,
  "source_url" TEXT,
  "occurred_at" TIMESTAMP(3),
  "reliability" DOUBLE PRECISION,
  "metadata_json" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_evidence_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_evidence_simulation_fkey" FOREIGN KEY ("simulation_id") REFERENCES "decision_simulation_run"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_evidence_move_fkey" FOREIGN KEY ("move_id") REFERENCES "decision_simulation_move"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_evidence_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "decision_simulation_actor"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_evidence_reliability_check" CHECK ("reliability" IS NULL OR ("reliability" >= 0 AND "reliability" <= 1))
);

CREATE TABLE "decision_simulation_assumption" (
  "id" TEXT NOT NULL,
  "simulation_id" TEXT NOT NULL,
  "move_id" TEXT,
  "statement" TEXT NOT NULL,
  "importance" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_assumption_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_assumption_simulation_fkey" FOREIGN KEY ("simulation_id") REFERENCES "decision_simulation_run"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_assumption_move_fkey" FOREIGN KEY ("move_id") REFERENCES "decision_simulation_move"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_assumption_importance_check" CHECK ("importance" IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  CONSTRAINT "decision_simulation_assumption_status_check" CHECK ("status" IN ('UNVERIFIED','SUPPORTED','CONTRADICTED','SUPERSEDED'))
);

CREATE TABLE "decision_simulation_outcome" (
  "id" TEXT NOT NULL,
  "simulation_id" TEXT NOT NULL,
  "predicted_move_id" TEXT,
  "actual_content" TEXT NOT NULL,
  "actual_actor_id" TEXT,
  "actual_at" TIMESTAMP(3),
  "semantic_match_score" DOUBLE PRECISION,
  "frame_match_score" DOUBLE PRECISION,
  "overall_accuracy_score" DOUBLE PRECISION,
  "learning_notes" TEXT,
  "reviewed_by_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_outcome_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_outcome_simulation_fkey" FOREIGN KEY ("simulation_id") REFERENCES "decision_simulation_run"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_outcome_predicted_move_fkey" FOREIGN KEY ("predicted_move_id") REFERENCES "decision_simulation_move"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_outcome_actor_fkey" FOREIGN KEY ("actual_actor_id") REFERENCES "decision_simulation_actor"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_outcome_semantic_check" CHECK ("semantic_match_score" IS NULL OR ("semantic_match_score" >= 0 AND "semantic_match_score" <= 1)),
  CONSTRAINT "decision_simulation_outcome_frame_check" CHECK ("frame_match_score" IS NULL OR ("frame_match_score" >= 0 AND "frame_match_score" <= 1)),
  CONSTRAINT "decision_simulation_outcome_accuracy_check" CHECK ("overall_accuracy_score" IS NULL OR ("overall_accuracy_score" >= 0 AND "overall_accuracy_score" <= 1))
);

CREATE INDEX "decision_simulation_actor_type_idx" ON "decision_simulation_actor"("actor_type");
CREATE INDEX "decision_simulation_run_status_created_idx" ON "decision_simulation_run"("status", "created_at");
CREATE INDEX "decision_simulation_run_actor_idx" ON "decision_simulation_run"("primary_counterpart_actor_id", "created_at");
CREATE INDEX "decision_simulation_move_simulation_ply_idx" ON "decision_simulation_move"("simulation_id", "ply");
CREATE INDEX "decision_simulation_move_parent_idx" ON "decision_simulation_move"("parent_move_id");
CREATE INDEX "decision_simulation_branch_from_idx" ON "decision_simulation_branch"("from_move_id", "rank");
CREATE INDEX "decision_simulation_evidence_simulation_idx" ON "decision_simulation_evidence"("simulation_id", "created_at");
CREATE INDEX "decision_simulation_evidence_actor_idx" ON "decision_simulation_evidence"("actor_id", "occurred_at");
CREATE INDEX "decision_simulation_assumption_simulation_idx" ON "decision_simulation_assumption"("simulation_id", "status");
CREATE INDEX "decision_simulation_outcome_simulation_idx" ON "decision_simulation_outcome"("simulation_id", "created_at");
CREATE INDEX "decision_simulation_outcome_actor_idx" ON "decision_simulation_outcome"("actual_actor_id", "actual_at");
