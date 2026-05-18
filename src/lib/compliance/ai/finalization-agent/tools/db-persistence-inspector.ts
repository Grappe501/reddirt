import { assessDbPersistenceReadiness } from "../../../persistence/db-readiness";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectDbPersistence(): Promise<FinalizationInspectorResult> {
  const db = await assessDbPersistenceReadiness();
  return {
    id: "db-persistence",
    label: "DB Persistence Inspector",
    score: db.score,
    status: db.score >= 85 ? "green" : db.score >= 60 ? "yellow" : "red",
    explanation: db.summary,
  };
}
