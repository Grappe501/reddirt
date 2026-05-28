import {
  loadKimHammerEvidenceIndex,
  resolveRetrievalTaskStatus,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import type { KimHammerRetrievalTaskStatus } from "@/lib/opposition/types/kimHammerEvidence";

const taskStatusBadge: Record<KimHammerRetrievalTaskStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-800",
  ASSIGNED: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  BLOCKED: "bg-rose-100 text-rose-800",
  READY_FOR_REVIEW: "bg-amber-100 text-amber-800",
  COMPLETE: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-zinc-100 text-zinc-700",
};

export default async function KimHammerIntelligenceGapsPage() {
  const index = loadKimHammerEvidenceIndex();
  const gaps = [...index.retrievalTasks].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          KH-3B Executable Task Board
        </p>
        <h1 className="font-heading text-2xl font-bold">Intelligence Gaps</h1>
        <p className="mt-2 text-xs text-kelly-muted">
          Read-only task board view. Task state is stored in JSON; live updates are not enabled on this page.
        </p>
      </header>

      <section className="mb-4 grid gap-3 sm:grid-cols-4">
        {(
          Object.entries(index.metrics.taskStatusCounts) as [KimHammerRetrievalTaskStatus, number][]
        )
          .filter(([, count]) => count > 0)
          .map(([status, count]) => (
            <div key={status} className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
              <p className="font-semibold text-kelly-navy">{status.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xl font-bold">{count}</p>
            </div>
          ))}
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Priority Queue</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Rank</th>
                <th className="py-1.5 pr-3 font-semibold">Task</th>
                <th className="py-1.5 pr-3 font-semibold">Status</th>
                <th className="py-1.5 pr-3 font-semibold">Owner</th>
                <th className="py-1.5 pr-3 font-semibold">Priority</th>
                <th className="py-1.5 pr-3 font-semibold">Due date</th>
                <th className="py-1.5 pr-3 font-semibold">Review</th>
                <th className="py-1.5 pr-3 font-semibold">Attack value</th>
                <th className="py-1.5 pr-3 font-semibold">Confidence need</th>
                <th className="py-1.5 pr-3 font-semibold">External readiness</th>
                <th className="py-1.5 font-semibold">Source path</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((gap) => {
                const taskStatus = resolveRetrievalTaskStatus(gap);
                return (
                  <tr key={gap.id} className="border-b border-kelly-text/5 align-top">
                    <td className="py-1.5 pr-3">{gap.rank ?? "-"}</td>
                    <td className="py-1.5 pr-3">
                      <p>{gap.description}</p>
                      {gap.completionNotes ? (
                        <p className="mt-1 text-[10px] text-kelly-muted">Notes: {gap.completionNotes}</p>
                      ) : null}
                    </td>
                    <td className="py-1.5 pr-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${taskStatusBadge[taskStatus]}`}
                      >
                        {taskStatus.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3">{gap.owner ?? "—"}</td>
                    <td className="py-1.5 pr-3">{gap.priority}</td>
                    <td className="py-1.5 pr-3">{gap.dueDate ?? "—"}</td>
                    <td className="py-1.5 pr-3">{gap.reviewRequired ? "Yes" : "No"}</td>
                    <td className="py-1.5 pr-3">{gap.attackValue ?? "—"}</td>
                    <td className="py-1.5 pr-3">{gap.confidenceNeed ?? "—"}</td>
                    <td className="py-1.5 pr-3">{gap.externalMessageReadiness ?? "—"}</td>
                    <td className="py-1.5">
                      {Array.isArray(gap.likelySourcePath) ? gap.likelySourcePath.join(" | ") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
