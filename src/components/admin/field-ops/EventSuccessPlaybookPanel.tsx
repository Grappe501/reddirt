import type { EventSuccessPlaybook } from "@/lib/kelly-agent/tools/event-success-playbook-tool";

export function EventSuccessPlaybookPanel({ playbook }: { playbook: EventSuccessPlaybook | null }) {
  if (!playbook) return null;
  return (
    <section className="rounded-lg border border-violet-300/70 bg-violet-50 px-6 py-5 font-body text-sm text-violet-950">
      <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-violet-900/80">AI event success playbook</h2>
      <p className="mt-2 text-xs text-violet-950/75">
        These are staff tasks and automation drafts I would prepare. Nothing has been sent; human approval and compliance
        gates remain required.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-violet-900/70">Recommended staff work</p>
          <ul className="mt-2 space-y-2 text-xs">
            {playbook.recommendedActions.map((a) => (
              <li key={a.actionType} className="rounded border border-violet-200 bg-white/80 px-3 py-2">
                <p className="font-semibold">
                  {a.actionType.replace(/_/g, " ")} · {a.recommendation.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-violet-950/75">{a.reason}</p>
                <p className="mt-1 text-[10px] text-violet-900/65">
                  Owner {a.suggestedOwner ?? "staff"} · human approval {String(a.requiresHumanApproval)}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-violet-900/70">Automation drafts (not sent)</p>
          <ul className="mt-2 space-y-2 text-xs">
            {playbook.automationDrafts.map((d) => (
              <li key={`${d.channel}-${d.audienceType}-${d.timing}`} className="rounded border border-violet-200 bg-white/80 px-3 py-2">
                <p className="font-semibold">
                  {d.channel} · {d.audienceType.replace(/_/g, " ")} · {d.timing.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-violet-950/75">{d.purpose}</p>
                <p className="mt-1 text-[10px] text-violet-900/65">
                  Compliance: {d.complianceStatus.replace(/_/g, " ")} · human approval required
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
