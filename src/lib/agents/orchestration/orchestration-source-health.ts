/**
 * Source health tracking for orchestration signal intake.
 */

export type OrchestrationSourceStatus = "ready" | "degraded" | "missing" | "error";

export type OrchestrationSourceHealth = {
  sourceId: string;
  label: string;
  status: OrchestrationSourceStatus;
  freshness?: string;
  detail?: string;
  paths?: string[];
};

export function sourceHealthFromSlice(
  sourceId: string,
  label: string,
  ok: boolean,
  data: unknown,
  error?: string,
  paths?: string[],
): OrchestrationSourceHealth {
  if (!ok) {
    return {
      sourceId,
      label,
      status: "error",
      detail: error ?? "loader failed",
      paths,
    };
  }
  if (data == null) {
    return { sourceId, label, status: "missing", detail: "No data returned", paths };
  }
  const freshness =
    typeof data === "object" &&
    data !== null &&
    "generatedAt" in data &&
    typeof (data as { generatedAt: unknown }).generatedAt === "string"
      ? (data as { generatedAt: string }).generatedAt
      : undefined;
  return {
    sourceId,
    label,
    status: "ready",
    freshness,
    paths,
  };
}
