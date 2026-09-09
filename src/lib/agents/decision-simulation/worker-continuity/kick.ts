import { WORKER_KICK_ACCEPT_MS } from "./contracts";

export function resolveDecisionSimWorkerSecret(): string {
  return process.env.DECISION_SIM_WORKER_SECRET?.trim() || process.env.ADMIN_SECRET?.trim() || "";
}

export function isDecisionSimWorkerAuthorized(request: Request): boolean {
  const expected = resolveDecisionSimWorkerSecret();
  if (!expected) return false;
  const header = request.headers.get("x-decision-sim-worker")?.trim();
  return Boolean(header && header === expected);
}

export function decisionSimWorkerOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
}

export async function kickDecisionSimulationWorker(
  jobId: string,
  origin: string,
): Promise<{ kicked: boolean; reason: string }> {
  const secret = resolveDecisionSimWorkerSecret();
  if (!secret) return { kicked: false, reason: "missing-worker-secret" };
  const url = `${origin.replace(/\/$/, "")}/api/admin/decision-simulator/jobs/${jobId}/work`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WORKER_KICK_ACCEPT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-decision-sim-worker": secret,
      },
      body: JSON.stringify({ jobId, continuity: true }),
      cache: "no-store",
      signal: controller.signal,
    });
    return { kicked: response.ok, reason: response.ok ? "accepted" : `http-${response.status}` };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return { kicked: true, reason: aborted ? "dispatched-timeout" : "dispatch-error" };
  } finally {
    clearTimeout(timer);
  }
}
