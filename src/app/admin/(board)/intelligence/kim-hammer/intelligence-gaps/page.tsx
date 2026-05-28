import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { MediaDerivedRetrievalTaskDraftsPanel } from "../MediaDerivedRetrievalTaskDraftsPanel";
import {
  KimHammerRetrievalTaskControls,
  type KimHammerRetrievalTaskRow,
} from "../EvidenceCommandTaskPanel";
import {
  loadKimHammerEvidenceIndex,
  resolveRetrievalTaskStatus,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import { getAllowedTaskTransitions } from "@/lib/opposition/kimHammerTaskWorkflow";
import type { KimHammerRetrievalTaskStatus } from "@/lib/opposition/types/kimHammerEvidence";
import { loadMediaDerivedTaskDrafts } from "@/lib/intelligence/mediaFindingPromotionWorkflow";

const taskStatusBadge: Record<KimHammerRetrievalTaskStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-800",
  ASSIGNED: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  BLOCKED: "bg-rose-100 text-rose-800",
  READY_FOR_REVIEW: "bg-amber-100 text-amber-800",
  COMPLETE: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-zinc-100 text-zinc-700",
};

function toTaskRow(task: ReturnType<typeof loadKimHammerEvidenceIndex>["retrievalTasks"][number]): KimHammerRetrievalTaskRow {
  const taskStatus = resolveRetrievalTaskStatus(task);
  return {
    id: task.id,
    rank: task.rank ?? null,
    title: task.description,
    taskStatus,
    owner: task.owner ?? "",
    priority: task.priority,
    dueDate: task.dueDate ?? null,
    completionNotes: task.completionNotes ?? "",
    reviewRequired: task.reviewRequired ?? false,
    externalReadiness: task.externalMessageReadiness ?? "—",
    allowedTransitions: getAllowedTaskTransitions(taskStatus),
  };
}

export default async function KimHammerIntelligenceGapsPage() {
  const index = loadKimHammerEvidenceIndex();
  const mediaTaskDrafts = loadMediaDerivedTaskDrafts();
  const gaps = [...index.retrievalTasks].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  return (
    <KimHammerBriefingPageShell moduleId="intelligence-gaps">
      <MediaDerivedRetrievalTaskDraftsPanel drafts={mediaTaskDrafts.drafts} />
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

      <section className="space-y-4">
        {gaps.map((gap) => {
          const taskStatus = resolveRetrievalTaskStatus(gap);
          return (
            <article key={gap.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-kelly-navy">#{gap.rank ?? "?"}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${taskStatusBadge[taskStatus]}`}
                >
                  {taskStatus.replaceAll("_", " ")}
                </span>
                <span className="text-kelly-muted">{gap.priority} priority</span>
              </div>
              <p className="mt-2 text-kelly-muted">{gap.description}</p>
              <p className="mt-1 text-[10px] text-kelly-muted">
                Owner: {gap.owner ?? "—"} · Due: {gap.dueDate ?? "—"} · External:{" "}
                {gap.externalMessageReadiness ?? "—"}
              </p>
              <p className="mt-1 text-[10px] text-kelly-muted">
                Source path:{" "}
                {Array.isArray(gap.likelySourcePath) ? gap.likelySourcePath.join(" | ") : "—"}
              </p>
              <KimHammerRetrievalTaskControls task={toTaskRow(gap)} compact />
            </article>
          );
        })}
      </section>
    </KimHammerBriefingPageShell>
  );
}
