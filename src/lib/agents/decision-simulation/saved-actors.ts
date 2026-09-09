import { prisma } from "@/lib/db";

export type SavedActorModelSummary = {
  id: string;
  name: string;
  version: string | null;
  effectiveAt: string | null;
  evidenceQuality: "UNKNOWN";
  uncertaintyLevel: "HYPOTHESIS" | "MIXED";
};

export async function getSavedDecisionSimulationActor(actorId: string): Promise<SavedActorModelSummary | null> {
  const actors = await listSavedDecisionSimulationActors();
  return actors.find((actor) => actor.id === actorId) ?? null;
}

export async function listSavedDecisionSimulationActors(): Promise<SavedActorModelSummary[]> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{ id: string; name: string; version: string | null; effective_at: Date | null }>
    >`
      SELECT a.id, a.name, v.version, v.effective_at
      FROM public.decision_simulation_actor a
      LEFT JOIN LATERAL (
        SELECT version, effective_at
        FROM public.decision_simulation_actor_model_version
        WHERE actor_id = a.id
        ORDER BY effective_at DESC
        LIMIT 1
      ) v ON TRUE
      ORDER BY a.name ASC
      LIMIT 50
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      version: row.version,
      effectiveAt: row.effective_at ? row.effective_at.toISOString() : null,
      evidenceQuality: "UNKNOWN",
      uncertaintyLevel: row.version ? "MIXED" : "HYPOTHESIS",
    }));
  } catch {
    return [];
  }
}
