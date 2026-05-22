import Link from "next/link";
import type { OrchestrationWorkflow } from "@/lib/agents/orchestration/orchestration-workflow-planner";

export function OrchestrationWorkflowPanel({ workflows }: { workflows: OrchestrationWorkflow[] }) {
  return (
    <section className="rounded-2xl border p-5">
      <h2 className="text-sm font-bold text-kelly-navy">Recommended workflows</h2>
      <p className="mt-1 text-xs text-kelly-muted">Orchestration prep only — no autonomous execution.</p>
      {workflows.length === 0 ? (
        <p className="mt-3 text-sm text-kelly-muted">No workflows activated for current state.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {workflows.map((w) => (
            <li key={w.id} className="rounded-xl border bg-kelly-page p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold text-kelly-navy">{w.title}</p>
                <span className="text-xs font-bold text-kelly-muted">Readiness {w.readinessScore}%</span>
              </div>
              <p className="mt-1 text-xs text-kelly-muted">{w.purpose}</p>
              <dl className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-bold text-kelly-muted">Trigger</dt>
                  <dd>{w.triggerCondition}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-muted">Owner</dt>
                  <dd>{w.recommendedOwner.replaceAll("_", " ")}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-muted">Human approval</dt>
                  <dd>{w.requiredHumanApproval ? "Required" : "Guidance only"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-muted">Done when</dt>
                  <dd>{w.doneWhenCriteria.join(" · ")}</dd>
                </div>
              </dl>
              {w.blockedBy.length > 0 ? (
                <p className="mt-2 text-xs text-amber-900">
                  <span className="font-bold">Blocked by:</span> {w.blockedBy.join("; ")}
                </p>
              ) : null}
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-kelly-muted">
                {w.steps.map((s) => (
                  <li key={s.id}>
                    {s.title}
                    {s.route ? (
                      <>
                        {" "}
                        —{" "}
                        <Link href={s.route} className="font-bold text-kelly-navy underline">
                          open
                        </Link>
                      </>
                    ) : null}
                    {s.humanGate === "review" ? " (human review)" : null}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
