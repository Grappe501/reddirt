import type { HumanActionQueueItem, HumanActionQueueSummary } from "@/lib/intelligence/types/humanActionQueue";
import { HumanActionQueueControls } from "./HumanActionQueueControls";

function ActionCard({ action }: { action: HumanActionQueueItem }) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-kelly-navy">{action.title}</p>
          <p className="mt-1 text-kelly-muted">{action.summary}</p>
        </div>
        <div className="text-right text-[10px] uppercase tracking-wider text-kelly-subtle">
          <p>{action.priority} · {action.urgency}</p>
          <p>{action.recommendedOwnerRole}</p>
          <p className="mt-1 font-semibold text-kelly-text">{action.status}</p>
        </div>
      </div>
      <p className="mt-2 text-kelly-text">
        <span className="font-semibold">Why it matters:</span> {action.whyItMatters}
      </p>
      <p className="mt-1 text-kelly-muted">
        <span className="font-semibold">Next step:</span> {action.recommendedNextStep}
      </p>
      {action.blockedBy.length > 0 ? (
        <p className="mt-1 text-rose-800">
          <span className="font-semibold">Blocked by:</span> {action.blockedBy.join(" ")}
        </p>
      ) : null}
      {action.sourceSystems.length > 0 ? (
        <p className="mt-1 text-kelly-subtle">Systems: {action.sourceSystems.join(", ")}</p>
      ) : null}
      {action.governanceWarnings.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-[10px] text-amber-900">
          {action.governanceWarnings.slice(0, 4).map((warning) => (
            <li key={warning.slice(0, 40)}>{warning}</li>
          ))}
        </ul>
      ) : null}
      <HumanActionQueueControls action={action} />
    </article>
  );
}

const DEBATE_WEEK_QUICK_LINKS = [
  { href: "/admin/intelligence/claims", label: "Claims review" },
  { href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command" },
  { href: "/admin/intelligence/llm-review-queue", label: "LLM review queue" },
  { href: "/admin/intelligence/debate-command", label: "Debate command" },
] as const;

type HumanActionQueueDashboardProps = {
  summary: HumanActionQueueSummary;
  priorityQueue: HumanActionQueueItem[];
  byOwner: Record<string, HumanActionQueueItem[]>;
  byCounty: Record<string, HumanActionQueueItem[]>;
  byNarrative: Record<string, HumanActionQueueItem[]>;
  byType: Record<string, HumanActionQueueItem[]>;
  debateWeekMode?: boolean;
};

export function HumanActionQueueDashboard({
  summary,
  priorityQueue,
  byOwner,
  byCounty,
  byNarrative,
  byType,
  debateWeekMode = false,
}: HumanActionQueueDashboardProps) {
  const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";

  const navLinks = debateWeekMode ? DEBATE_WEEK_QUICK_LINKS : null;

  return (
    <div className="space-y-6">
      {navLinks ? (
        <section className="flex flex-wrap gap-2 text-xs">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded border border-kelly-text/15 bg-white px-3 py-1.5 font-semibold text-kelly-navy hover:bg-kelly-page"
            >
              {link.label}
            </a>
          ))}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Recommended</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.recommendedCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Urgent</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.urgentCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Blocked</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.blockedCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">High opportunity</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.highOpportunityCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Active total</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.totalActions}</p>
        </div>
      </section>

      {debateWeekMode ? null : (
        <section className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-950">
            NSI-15 · INTERNAL_USE_ONLY · NON_PUBLISHABLE · RECOMMENDATION_ONLY
          </p>
          <p className="mt-1 text-xs text-rose-900">
            The system recommends actions only. Operators decide, approve, publish, export, and act. No autonomous execution.
          </p>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Priority queue</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {priorityQueue.slice(0, 12).map((action) => (
            <ActionCard key={action.actionId} action={action} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Owner role view</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {Object.entries(byOwner).map(([role, actions]) => (
            <div key={role} className="rounded-xl border border-kelly-text/10 bg-white p-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-kelly-navy">{role}</h3>
              <ul className="mt-2 space-y-2 text-xs text-kelly-muted">
                {actions.slice(0, 5).map((action) => (
                  <li key={action.actionId}>
                    {action.title} ({action.priority})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">County view</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {Object.entries(byCounty).slice(0, 9).map(([countyId, actions]) => (
            <div key={countyId} className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
              <p className="font-bold text-kelly-navy">{countyId}</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {actions.slice(0, 3).map((a) => (
                  <li key={a.actionId}>{a.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Narrative view</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {Object.entries(byNarrative).slice(0, 9).map(([narrativeId, actions]) => (
            <div key={narrativeId} className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
              <p className="font-bold text-kelly-navy">{narrativeId}</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {actions.slice(0, 3).map((a) => (
                  <li key={a.actionId}>{a.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Action type view</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {Object.entries(byType).map(([actionType, actions]) => (
            <div key={actionType} className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
              <p className="font-bold text-kelly-navy">{actionType}</p>
              <p className="mt-1 text-kelly-muted">{actions.length} item(s)</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
