import Link from "next/link";
import type { ReactNode } from "react";

import {
  getArkansasStoryCorps,
  getArkansasTrustNetwork,
  getDirectDemocracyInitiative,
  getMobilizeAutomationRules,
  getPhase18BudgetAdditions,
  getThankYouDoctrine,
} from "@/lib/election-plan/load-movement-infrastructure";
import { phase18MasterPlanHref } from "@/lib/election-plan/phase-18-movement-infrastructure";
import { formatBudget } from "@/lib/election-plan/electionPlanData";

function ModulePageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18 · {title}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href={phase18MasterPlanHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← Phase 18 master plan
          </Link>
          {children}
        </div>
      </div>
    </>
  );
}

export function TrustNetworkPanel() {
  const trust = getArkansasTrustNetwork();
  return (
    <ModulePageShell title="Arkansas Trust Network">
      <h1 className="mt-4 font-heading text-2xl font-bold">{trust.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{trust.doctrine}</p>
      <p className="mt-4 text-sm">{trust.objective}</p>
      <div className="my-6 ep-stat-grid">
        {Object.entries(trust.metrics).map(([k, v]) => (
          <div key={k} className="ep-stat">
            <div className="ep-stat-value">{v}</div>
            <div className="ep-stat-label">{k.replace(/([A-Z])/g, " $1")}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {trust.relationshipTypes.map((r) => (
          <div key={r.id} className="ep-card text-sm">
            <h3 className="font-heading font-bold">{r.label}</h3>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{r.prompt}</p>
          </div>
        ))}
      </div>
      <Link href={trust.searcyCountyPilot.href} className="mt-6 inline-block text-sm font-semibold underline">
        {trust.searcyCountyPilot.label} →
      </Link>
    </ModulePageShell>
  );
}

export function StoryCorpsPanel() {
  const story = getArkansasStoryCorps();
  return (
    <ModulePageShell title="Arkansas Story Corps">
      <h1 className="mt-4 font-heading text-2xl font-bold">{story.title}</h1>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{story.subtitle}</p>
      <p className="mt-4 text-sm">Equipment budget: {formatBudget(story.equipmentBudget)} — {story.equipmentNote}</p>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {story.teams.map((team) => (
          <div key={team.id} className="ep-card">
            <h3 className="font-heading font-bold">{team.label}</h3>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{team.focus}</p>
            <p className="mt-2 text-xs">{team.platforms.join(" · ")}</p>
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}

export function DirectDemocracyElectionPlanPanel() {
  const dd = getDirectDemocracyInitiative();
  return (
    <ModulePageShell title="Direct Democracy Initiative">
      <h1 className="mt-4 font-heading text-2xl font-bold">{dd.title}</h1>
      <blockquote className="ep-card-glass mt-4 border-l-4 border-[var(--ep-gold)] pl-4 text-sm italic">{dd.signatureIssue}</blockquote>
      <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">{dd.doctrine}</p>
      <h2 className="mb-3 mt-8 font-heading font-bold">Ballot Initiative Resource Center</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(dd.resourceCenter).map(([key, row]) => (
          <div key={key} className="ep-card text-sm">
            <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="mt-1 tabular-nums">
              {row.count} / {row.goal} · {row.status}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href={dd.publicHref} className="ep-chapter-link" target="_blank" rel="noopener noreferrer">
          Public direct democracy hub ↗
        </Link>
        <Link href={dd.publicBallotProcessHref} className="ep-chapter-link" target="_blank" rel="noopener noreferrer">
          Ballot initiative process ↗
        </Link>
      </div>
      <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">Surfaces: {dd.integrationSurfaces.join(" · ")}</p>
    </ModulePageShell>
  );
}

export function MobilizeRulesPanel() {
  const rules = getMobilizeAutomationRules();
  return (
    <ModulePageShell title="Mobilize Enforcement">
      <h1 className="mt-4 font-heading text-2xl font-bold">Mobilize automation rules</h1>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{rules.doctrine}</p>
      <div className="ep-warning mt-6 text-sm">
        <p className="font-bold text-red-800">{rules.warningLabel}</p>
        <p className="mt-2">Displayed on Forward Motion stops when Mobilize is required but not drafted/approved/published.</p>
      </div>
      <ul className="mt-6 list-inside list-disc space-y-1 text-sm">
        {rules.volunteerTrigger.eventTypesRequiringMobilize.map((t) => (
          <li key={t}>{t.replace("_", " ")}</li>
        ))}
      </ul>
    </ModulePageShell>
  );
}

export function ThankYouDoctrinePanel() {
  const doctrine = getThankYouDoctrine();
  const budget = getPhase18BudgetAdditions();
  return (
    <ModulePageShell title="Thank-You Doctrine">
      <h1 className="mt-4 font-heading text-2xl font-bold">Thank-you & recognition system</h1>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{doctrine.doctrine}</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Host thank-you</h3>
          <ul className="mt-3 list-inside list-disc text-sm">
            {doctrine.hostThankYou.items.map((i) => (
              <li key={i.id}>{i.label}</li>
            ))}
          </ul>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Volunteer lead thank-you</h3>
          <ul className="mt-3 list-inside list-disc text-sm">
            {doctrine.volunteerLeadThankYou.items.map((i) => (
              <li key={i.id}>{i.label}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-sm">Budget line: {formatBudget(budget.lineItems.find((l) => l.id === "thank-you-gift-cards")?.amount ?? 20)} per lead host</p>
    </ModulePageShell>
  );
}

export function Phase18BudgetPanel() {
  const budget = getPhase18BudgetAdditions();
  return (
    <ModulePageShell title="Phase 18 Budget">
      <h1 className="mt-4 font-heading text-2xl font-bold">Phase 18 budget additions</h1>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{budget.disclaimer}</p>
      <p className="mt-4 font-heading text-xl font-bold">Incremental total: {formatBudget(budget.phase18IncrementalTotal)}</p>
      <table className="mt-6 w-full text-left text-sm ep-card">
        <thead>
          <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
            <th className="py-2 pr-3">Category</th>
            <th className="py-2 pr-3">Line</th>
            <th className="py-2 pr-3">Amount</th>
            <th className="py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {budget.lineItems.map((row) => (
            <tr key={row.id} className="border-b border-[var(--ep-border)] last:border-0">
              <td className="py-2 pr-3">{row.category}</td>
              <td className="py-2 pr-3 font-medium">{row.label}</td>
              <td className="py-2 pr-3 tabular-nums">
                {row.amount != null ? formatBudget(row.amount) : row.unit}
              </td>
              <td className="py-2 text-xs text-[var(--ep-navy-muted)]">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/election-plan/executive-book/budget" className="mt-6 inline-block text-sm font-semibold underline">
        Executive Book budget chapter →
      </Link>
    </ModulePageShell>
  );
}
