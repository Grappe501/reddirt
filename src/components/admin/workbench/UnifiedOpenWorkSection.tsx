import Link from "next/link";
import type { UnifiedOpenWorkItem } from "@/lib/campaign-engine/open-work";

function sourceBadge(s: UnifiedOpenWorkItem["source"]): { label: string; hint: string } {
  if (s === "EmailWorkflowItem") return { label: "Email", hint: "Email workflow queue" };
  if (s === "WorkflowIntake") return { label: "Intake", hint: "Workflow intake" };
  return { label: "Task", hint: "Campaign task" };
}

/**
 * UWR-1: read-only, additive. Rows link to existing admin routes; no mutations.
 */
export function UnifiedOpenWorkSection({ items }: { items: UnifiedOpenWorkItem[] }) {
  if (items.length === 0) return null;
  return (
    <section
      className="border-b border-kelly-text/10 bg-kelly-page/60 px-2 py-2 md:px-3"
      aria-label="Unified open work, read only"
    >
      <h2 className="font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Unified open work</h2>
      <p className="mt-0.5 max-w-3xl text-[10px] text-kelly-text/55">
        UWR-1 triage slice (unassigned + escalated email). Sources: email workflow, workflow intake, campaign task — not
        every domain.
      </p>
      <ul className="mt-1.5 max-h-52 space-y-1 overflow-y-auto pr-0.5">
        {items.map((row) => {
          const b = sourceBadge(row.source);
          return (
            <li
              key={`${row.source}-${row.id}`}
              className="flex min-w-0 items-start justify-between gap-2 rounded border border-kelly-text/8 bg-kelly-page/95 px-1.5 py-1 text-[11px] leading-tight"
            >
              <div className="min-w-0">
                <span className="text-[9px] font-semibold uppercase tracking-tight text-kelly-text/50" title={b.hint}>
                  {b.label}
                </span>
                {row.escalationLabel ? (
                  <span className="ml-1 text-[9px] font-bold text-amber-900">· {row.escalationLabel}</span>
                ) : null}
                <br />
                <Link href={row.href} className="font-medium text-kelly-slate [overflow-wrap:anywhere] hover:underline">
                  {row.summaryLine}
                </Link>{" "}
                <span className="whitespace-nowrap text-kelly-text/45">· {row.statusLabel}</span>
              </div>
              <Link
                href={row.workbenchRouteHint}
                className="shrink-0 self-center text-[9px] font-semibold text-kelly-slate hover:underline"
                title="Related workbench"
              >
                {b.label === "Task" ? "Tasks" : b.label === "Intake" ? "Comms" : "Queue"}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
