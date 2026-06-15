import Link from "next/link";

import { PHASE_18_MOVEMENT_INFRASTRUCTURE, phase18MasterPlanHref } from "@/lib/election-plan/phase-18-movement-infrastructure";
import {
  getArkansasStoryCorps,
  getArkansasTrustNetwork,
  getCampusNetworkRollup,
  getDirectDemocracyInitiative,
  getPhase18BudgetAdditions,
} from "@/lib/election-plan/load-movement-infrastructure";
import { formatBudget } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

function moduleStatusClass(status: "complete" | "in_progress" | "pending") {
  if (status === "complete") return "bg-emerald-100 text-emerald-900";
  if (status === "in_progress") return "bg-amber-100 text-amber-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

export function Phase18MovementInfrastructurePanel() {
  const plan = PHASE_18_MOVEMENT_INFRASTRUCTURE;
  const campus = getCampusNetworkRollup();
  const trust = getArkansasTrustNetwork();
  const story = getArkansasStoryCorps();
  const dd = getDirectDemocracyInitiative();
  const budget = getPhase18BudgetAdditions();

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      </div>

      <div className="ep-card-glass mb-6 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{plan.intro}</div>

      <div className="mb-8 ep-card border-2 border-[var(--ep-gold)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7A · Budget & Influence Activation</p>
        <h3 className="mt-1 font-heading font-bold text-[var(--ep-navy)]">Leadership sprint — live now</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/election-plan/executive-book/budget" className="rounded-full bg-[var(--ep-navy)] px-3 py-1 text-xs font-semibold text-white">
            Executive Book budget →
          </Link>
          <Link href="/election-plan/executive-book/budget/dashboard" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            Budget dashboard →
          </Link>
          <Link href="/election-plan/movement-infrastructure/lte-program" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            Citizen Voices LTE →
          </Link>
          <Link href="/election-plan/campuses/freshman-week" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            Freshman Week →
          </Link>
          <Link href="/election-plan/executive-book/labor-day/resource-gap" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            Labor Day gaps →
          </Link>
        </div>
      </div>

      <div className="mb-8 ep-card border-2 border-[var(--ep-navy)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-navy-muted)]">Phase 18.7B · Ownership Activation</p>
        <h3 className="mt-1 font-heading font-bold text-[var(--ep-navy)]">Who makes it happen this week?</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/election-plan/leadership" className="rounded-full bg-[var(--ep-navy)] px-3 py-1 text-xs font-semibold text-white">
            Leadership hub →
          </Link>
          <Link href="/election-plan/leadership/responsibility-matrix" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            Responsibility matrix →
          </Link>
          <Link href="/election-plan/leadership/weekly-packet" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            Weekly packet →
          </Link>
          <Link href="/election-plan/leadership/county-coverage" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            County coverage →
          </Link>
          <Link href="/election-plan/power-of-5/command-center" className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold">
            Power of 5 →
          </Link>
        </div>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{campus.campusCount}</div>
          <div className="ep-stat-label">Campuses in registry</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{campus.registrationGoal.toLocaleString()}</div>
          <div className="ep-stat-label">Campus reg. goals</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{campus.captainsVacant}</div>
          <div className="ep-stat-label">Captains vacant</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatBudget(budget.phase18IncrementalTotal)}</div>
          <div className="ep-stat-label">Phase 18 budget adds</div>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Overlay targets</h3>
      <div className="mb-8 flex flex-wrap gap-2">
        {plan.overlayTargets.map((t) => (
          <Link
            key={t.system}
            href={t.link}
            className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            {t.system} →
          </Link>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Ten modules</h3>
      <div className="mb-8 grid gap-3 lg:grid-cols-2">
        {plan.modules.map((mod) => (
          <Link key={mod.id} href={mod.href} className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-heading font-bold text-[var(--ep-navy)]">{mod.title}</h4>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", moduleStatusClass(mod.status))}>
                {mod.status.replace("_", " ")}
              </span>
            </div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--ep-navy-muted)]">
              {mod.items.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="ep-card text-sm">
          <h4 className="font-heading font-bold">Trust Network</h4>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{trust.doctrine}</p>
          <Link href="/election-plan/movement-infrastructure/trust-network" className="mt-3 inline-block text-xs font-semibold underline">
            Open →
          </Link>
        </div>
        <div className="ep-card text-sm">
          <h4 className="font-heading font-bold">Story Corps</h4>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{story.subtitle}</p>
          <Link href="/election-plan/movement-infrastructure/story-corps" className="mt-3 inline-block text-xs font-semibold underline">
            Open →
          </Link>
        </div>
        <div className="ep-card text-sm">
          <h4 className="font-heading font-bold">Direct Democracy</h4>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{dd.signatureIssue}</p>
          <Link href="/election-plan/direct-democracy" className="mt-3 inline-block text-xs font-semibold underline">
            Resource center →
          </Link>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href={phase18MasterPlanHref()} className="font-semibold text-[var(--ep-gold)] hover:underline">
          Phase 18 build master plan →
        </Link>
      </p>
    </section>
  );
}
