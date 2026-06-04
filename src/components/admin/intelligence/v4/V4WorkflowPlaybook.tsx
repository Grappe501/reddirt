import Link from "next/link";
import { DEBATE_WORKFLOW_STEPS, KELLY_MASTER_FRAME } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";

export function V4WorkflowPlaybook() {
  return (
    <section className="mb-8 rounded-xl border-2 border-kelly-navy/15 bg-kelly-page/50 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Kelly debate playbook</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">How to run this workbench — step by step</h2>
      <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
        This is not a document dump. It is a rehearsal system: orient → drill → verify → command check. Your public story is
        always <span className="font-semibold text-kelly-navy">{KELLY_MASTER_FRAME.headline}</span>. Every answer should
        move through: {KELLY_MASTER_FRAME.answerArchitecture}
      </p>

      <div className="mt-4 rounded-lg border border-violet-200/50 bg-white p-4">
        <p className="text-xs font-bold uppercase text-violet-950">Three pillars (repeat all night)</p>
        <ol className="mt-2 list-inside list-decimal text-sm text-kelly-muted">
          {KELLY_MASTER_FRAME.pillars.map((p) => (
            <li key={p.slice(0, 40)}>{p}</li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-kelly-muted">
          <span className="font-bold text-kelly-navy">Contrast method:</span> {KELLY_MASTER_FRAME.contrastMethod}
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {DEBATE_WORKFLOW_STEPS.map((step) => (
          <article key={step.href} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-violet-800">Step {step.step}</p>
                <h3 className="font-heading text-lg font-bold text-kelly-navy">{step.title}</h3>
              </div>
              <Link
                href={step.href}
                className="rounded-full border border-kelly-navy/30 bg-kelly-page px-3 py-1 text-xs font-bold text-kelly-navy"
              >
                Open step {step.step}
              </Link>
            </div>
            <V4OperatorGuide guide={step.guide} />
          </article>
        ))}
      </div>
    </section>
  );
}
