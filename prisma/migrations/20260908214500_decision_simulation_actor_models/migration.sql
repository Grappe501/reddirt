-- Decision Simulation Engine — Phase 4 actor model persistence
-- Adds versioned actor behavior models and evidence-backed signal rows.
-- No send/post execution is introduced.

CREATE TABLE "decision_simulation_actor_model_version" (
  "id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "effective_at" TIMESTAMP(3) NOT NULL,
  "description" TEXT,
  "primary_incentives_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "strategic_constraints_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "preferred_frames_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "attack_lanes_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "defensive_frames_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "escalation_tendencies_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "deescalation_tendencies_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "communication_style_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "likely_audiences_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "uncertainty_notes_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_actor_model_version_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_actor_model_version_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "decision_simulation_actor"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_actor_model_version_unique" UNIQUE ("actor_id", "version")
);

CREATE TABLE "decision_simulation_actor_signal" (
  "id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "model_version_id" TEXT,
  "signal_type" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "source_state" TEXT NOT NULL,
  "weight" DOUBLE PRECISION,
  "confidence" TEXT NOT NULL,
  "trigger_text" TEXT,
  "notes" TEXT,
  "evidence_id" TEXT,
  "observed_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_actor_signal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_actor_signal_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "decision_simulation_actor"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_actor_signal_model_fkey" FOREIGN KEY ("model_version_id") REFERENCES "decision_simulation_actor_model_version"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_actor_signal_evidence_fkey" FOREIGN KEY ("evidence_id") REFERENCES "decision_simulation_evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_actor_signal_state_check" CHECK ("source_state" IN ('OBSERVED','INFERRED','HYPOTHESIS')),
  CONSTRAINT "decision_simulation_actor_signal_confidence_check" CHECK ("confidence" IN ('LOW','MEDIUM','HIGH')),
  CONSTRAINT "decision_simulation_actor_signal_weight_check" CHECK ("weight" IS NULL OR "weight" >= 0)
);

CREATE TABLE "decision_simulation_actor_variation" (
  "id" TEXT NOT NULL,
  "ensemble_job_id" TEXT,
  "simulation_id" TEXT,
  "actor_id" TEXT NOT NULL,
  "model_version_id" TEXT NOT NULL,
  "run_ordinal" INTEGER NOT NULL,
  "seed" BIGINT NOT NULL,
  "selected_primary_frame" TEXT,
  "selected_attack_lane" TEXT,
  "selected_escalation_tendency" TEXT,
  "aggressiveness" DOUBLE PRECISION NOT NULL,
  "novelty" DOUBLE PRECISION NOT NULL,
  "model_confidence_modifier" DOUBLE PRECISION NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decision_simulation_actor_variation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "decision_simulation_actor_variation_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "decision_simulation_actor"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_actor_variation_model_fkey" FOREIGN KEY ("model_version_id") REFERENCES "decision_simulation_actor_model_version"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_actor_variation_simulation_fkey" FOREIGN KEY ("simulation_id") REFERENCES "decision_simulation_run"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "decision_simulation_actor_variation_aggressiveness_check" CHECK ("aggressiveness" >= 0 AND "aggressiveness" <= 1),
  CONSTRAINT "decision_simulation_actor_variation_novelty_check" CHECK ("novelty" >= 0 AND "novelty" <= 1),
  CONSTRAINT "decision_simulation_actor_variation_confidence_modifier_check" CHECK ("model_confidence_modifier" >= 0.5 AND "model_confidence_modifier" <= 1.5)
);

CREATE INDEX "decision_simulation_actor_model_actor_effective_idx" ON "decision_simulation_actor_model_version"("actor_id", "effective_at");
CREATE INDEX "decision_simulation_actor_signal_actor_type_idx" ON "decision_simulation_actor_signal"("actor_id", "signal_type");
CREATE INDEX "decision_simulation_actor_signal_model_idx" ON "decision_simulation_actor_signal"("model_version_id", "source_state");
CREATE INDEX "decision_simulation_actor_variation_actor_run_idx" ON "decision_simulation_actor_variation"("actor_id", "run_ordinal");
CREATE INDEX "decision_simulation_actor_variation_sim_idx" ON "decision_simulation_actor_variation"("simulation_id");
