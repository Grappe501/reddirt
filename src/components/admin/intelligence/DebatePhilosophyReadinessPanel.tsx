import Link from "next/link";
import type { DebateCommandPhilosophyReadinessFeed } from "@/lib/intelligence/v4/debateCommandPhilosophyReadiness";

function statusTone(status: "ready" | "partial" | "gap"): string {
  if (status === "ready") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (status === "partial") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

export function DebatePhilosophyReadinessPanel({ feed }: { feed: DebateCommandPhilosophyReadinessFeed }) {
  return (
    <section className="mb-6 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/30 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">
            Phase 11 P2 · Philosophy readiness feed
          </p>
          <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">Strategy & philosophy wiring</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            Movement corpus + staff strategy surfaces + migration bridge — feeds debate prep when research is thin on
            tone alignment.
          </p>
        </div>
        <p className="font-heading text-2xl font-bold text-indigo-950">{feed.overallScore}%</p>
      </div>

      <ul className="mt-4 space-y-2">
        {feed.rows.map((row) => (
          <li
            key={row.id}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${statusTone(row.status)}`}
          >
            <div>
              <Link href={row.href} className="font-bold underline">
                {row.label}
              </Link>
              <p className="text-[11px] opacity-90">{row.detail}</p>
            </div>
            <span className="font-heading text-lg font-bold">{row.score}%</span>
          </li>
        ))}
      </ul>

      {feed.gaps.length > 0 ? (
        <ul className="mt-3 list-inside list-disc text-xs text-kelly-muted">
          {feed.gaps.map((g) => (
            <li key={g.slice(0, 40)}>{g}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {feed.nextModules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-950"
          >
            {m.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
