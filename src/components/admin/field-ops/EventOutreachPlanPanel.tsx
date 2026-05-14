import type { EventOutreachPlan } from "@/lib/kelly-agent/tools/event-outreach-plan-tool";

export function EventOutreachPlanPanel({ plan }: { plan: EventOutreachPlan }) {
  return (
    <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
      <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">These are the emails I would prepare</h2>
      <p className="mt-2 text-xs text-kelly-text/65">
        Kelly agent recommendation only. Staff must create, edit, approve test, approve live, and send each batch.
      </p>
      <div className="mt-4 space-y-3">
        {plan.recommendedEmails.map((email) => (
          <article key={`${email.purpose}-${email.audience}-${email.timing}`} className="rounded border border-kelly-text/12 bg-kelly-wash/60 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-kelly-text">{email.purpose.replace(/_/g, " ")}</h3>
                <p className="mt-1 text-xs text-kelly-text/70">
                  {email.audience.replace(/_/g, " ")} · {email.timing.replace(/_/g, " ")}
                </p>
              </div>
              <span className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase text-kelly-text/70">human approval required</span>
            </div>
            <p className="mt-2 text-xs">{email.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="rounded border bg-white px-2 py-1">Create draft</span>
              <span className="rounded border bg-white px-2 py-1">Edit</span>
              <span className="rounded border bg-white px-2 py-1">Approve test</span>
              <span className="rounded border bg-white px-2 py-1">Hold</span>
              <span className="rounded border bg-white px-2 py-1">Reject</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-text/45">Not recommended</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-kelly-text/70">
            {plan.notRecommended.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-text/45">Compliance warnings</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-kelly-text/70">
            {plan.complianceWarnings.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
