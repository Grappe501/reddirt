import Link from "next/link";
import { DEBATE_WEEK_PRIMARY_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";

const stepCard =
  "flex flex-col rounded-lg border border-violet-900/15 bg-white p-4 shadow-sm transition hover:border-violet-800/30";

/**
 * First-visit orientation for Kelly — matches primary nav order.
 */
export function IntelligenceCandidateOrientation() {
  const steps = DEBATE_WEEK_PRIMARY_NAV_ITEMS;

  return (
    <section className="mb-6 rounded-2xl border-2 border-violet-900/20 bg-gradient-to-br from-violet-50/80 via-white to-kelly-page p-5 lg:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-900">Welcome, Kelly</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy lg:text-3xl">
        Your debate intelligence workbench
      </h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-muted">
        This area is your private prep room for the Secretary of State race — opponent record, rehearsal prompts, and
        what is safe to say.         Follow the five steps below; use &ldquo;All tools&rdquo; for staff surfaces.
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <li key={step.href}>
            <Link href={step.href} className={stepCard}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800">Step {index + 1}</span>
              <span className="mt-2 font-heading text-lg font-bold text-kelly-navy">{step.label}</span>
              <span className="mt-2 text-xs leading-relaxed text-kelly-muted">{step.description}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
