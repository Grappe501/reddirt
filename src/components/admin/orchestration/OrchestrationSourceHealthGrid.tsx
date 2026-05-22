import type { OrchestrationSourceHealth } from "@/lib/agents/orchestration/orchestration-source-health";

const STATUS_STYLES: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-900 border-emerald-200",
  degraded: "bg-amber-100 text-amber-900 border-amber-200",
  missing: "bg-orange-100 text-orange-900 border-orange-200",
  error: "bg-red-100 text-red-900 border-red-200",
};

export function OrchestrationSourceHealthGrid({ sources }: { sources: OrchestrationSourceHealth[] }) {
  const readyCount = sources.filter((s) => s.status === "ready").length;

  return (
    <section className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-kelly-navy">Source health map</h2>
        <p className="text-xs text-kelly-muted">
          {readyCount}/{sources.length} ready — AI must know what it does not know
        </p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s) => (
          <div key={s.sourceId} className={`rounded-lg border p-3 ${STATUS_STYLES[s.status] ?? STATUS_STYLES.missing}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold">{s.label}</p>
              <span className="text-[10px] font-bold uppercase">{s.status}</span>
            </div>
            {s.freshness ? <p className="mt-1 text-[10px] opacity-80">Fresh: {new Date(s.freshness).toLocaleString()}</p> : null}
            {s.detail ? <p className="mt-1 text-[10px] opacity-90">{s.detail}</p> : null}
            {s.status !== "ready" ? (
              <p className="mt-2 text-[10px] font-bold">→ Add/fix signal or treat as blocker in reasoning</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
