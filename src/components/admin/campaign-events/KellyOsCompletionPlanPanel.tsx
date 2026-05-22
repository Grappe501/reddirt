import Link from "next/link";

/** Static planning surface — links to in-repo docs (operator copy). */
export function KellyOsCompletionPlanPanel({
  presentationScore,
  presentationLabel,
  stabilityGate = "pass",
}: {
  presentationScore: number;
  presentationLabel: string;
  stabilityGate?: "pass" | "warn" | "fail";
}) {
  const gateColor =
    stabilityGate === "pass" ? "border-emerald-600/30 bg-emerald-600/5" : stabilityGate === "warn" ? "border-amber-600/30 bg-amber-600/5" : "border-red-600/30 bg-red-600/5";

  return (
    <section className={`rounded-2xl border p-6 ${gateColor}`} aria-labelledby="kelly-os-plan-heading">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly OS completion plan</p>
      <h2 id="kelly-os-plan-heading" className="mt-1 font-heading text-lg font-bold text-kelly-navy">
        Sprint audit · training · copilots (planning)
      </h2>
      <p className="mt-2 text-xs text-kelly-text/70">
        Feature building paused. Next work: stability gate → training layer → dashboard modules → copilots. SaaS expansion
        deferred until Kelly presentation-ready ({presentationScore}/100 · {presentationLabel}).
      </p>
      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold text-kelly-navy">Stability gate</dt>
          <dd>{stabilityGate === "pass" ? "Typecheck + build verified on feature branch" : "Run npm run check before deploy"}</dd>
        </div>
        <div>
          <dt className="font-bold text-kelly-navy">Next priority</dt>
          <dd>Main/Netlify merge · Mar/Apr/May reimbursement · training unlocks</dd>
        </div>
        <div>
          <dt className="font-bold text-kelly-navy">Training layer</dt>
          <dd>Planned — unobtrusive tooltips, modules, progressive dashboards</dd>
        </div>
        <div>
          <dt className="font-bold text-kelly-navy">Copilots planned</dt>
          <dd>Volunteer, intern, field manager, social, communications lead</dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] text-kelly-text/50">
        Docs: <code className="text-[10px]">RedDirt/docs/campaign-events/FULL_SPRINT_STATUS_REVIEW.md</code>,{" "}
        <code className="text-[10px]">KELLY_SINGLE_CAMPAIGN_OS_COMPLETION_PLAN.md</code>,{" "}
        <code className="text-[10px]">REVISED_KELLY_OS_SPRINT_ROADMAP.md</code>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/onboarding" className="rounded-full border border-kelly-navy/25 px-3 py-1.5 text-xs font-bold text-kelly-navy">
          Role onboarding
        </Link>
        <Link
          href="/admin/ai-command-center/dashboard-builder"
          className="rounded-full border border-kelly-navy/25 px-3 py-1.5 text-xs font-bold text-kelly-navy"
        >
          Dashboard builder
        </Link>
        <Link href="/admin/campaign-events/ai-tools" className="rounded-full border border-kelly-navy/25 px-3 py-1.5 text-xs font-bold text-kelly-navy">
          Tool catalog (planning stubs)
        </Link>
      </div>
    </section>
  );
}
