import Link from "next/link";
import type { OrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";
import { OrchestrationCopyBriefingButton } from "./OrchestrationCopyBriefingButton";

const URGENCY_STYLES: Record<string, string> = {
  P0: "border-red-300 bg-red-50",
  P1: "border-amber-300 bg-amber-50",
  P2: "border-kelly-navy/15 bg-white",
};

export function OrchestrationTopMoves({ payload }: { payload: OrchestrationStatePayload }) {
  const moves = payload.topMoves;

  return (
    <section className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-kelly-navy">Top 3 recommended moves</h2>
        <OrchestrationCopyBriefingButton payload={payload} />
      </div>
      {moves.length === 0 ? (
        <p className="mt-3 text-sm text-kelly-muted">No urgent moves — review workflows below.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {moves.map((m) => (
            <li key={m.rank} className={`rounded-xl border p-4 ${URGENCY_STYLES[m.urgency] ?? URGENCY_STYLES.P2}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold text-kelly-navy">
                  #{m.rank} {m.title}
                </p>
                <span className="text-[10px] font-bold uppercase text-kelly-muted">{m.urgency} · {m.domainId.replaceAll("_", " ")}</span>
              </div>
              <p className="mt-2 text-sm text-kelly-muted">
                <span className="font-bold text-kelly-navy">Why this matters:</span> {m.whyThisMatters}
              </p>
              <p className="mt-2 text-xs text-kelly-subtle">Human approval required before any execution.</p>
              {m.route ? (
                <Link href={m.route} className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
                  View details →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
