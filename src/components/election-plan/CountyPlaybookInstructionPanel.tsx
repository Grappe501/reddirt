import Link from "next/link";

import {
  COUNTY_PLAYBOOK_LAYERS,
  COUNTY_TIER_GUIDANCE,
  COUNTY_WEEKLY_OPERATOR_FLOW,
  MOBILIZE_COUNTY_PLAYBOOK_STEPS,
} from "@/lib/election-plan/county-playbook-operator-guide";
import {
  COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS,
  countyPlaybookBundleMetaFromJson,
} from "@/lib/election-plan/county-playbook-links";
import playbookBundle from "../../../data/election-plan/county-playbook-markdown.json";

export function CountyPlaybookInstructionPanel() {
  const meta = countyPlaybookBundleMetaFromJson(playbookBundle);
  const generated = meta.generatedAt
    ? new Date(meta.generatedAt).toLocaleDateString("en-US", { dateStyle: "medium" })
    : null;

  return (
    <section className="mb-8 space-y-6">
      <div className="ep-card border-2 border-[var(--ep-gold)]/30 bg-[var(--ep-cream)]/50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">County playbook drill-down</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">How to use the 75-county system</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          Each county has three integrated layers — strategy prose (Ch. 9), drop-off math (Ch. 4), and registration
          dashboard (Ch. 5). Open a county card below, then use the Executive Book crosswalk links inside the operating
          center. All content ships in Election Plan bundles
          {generated ? ` (last built ${generated}, ${meta.countyCount} counties)` : ""}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.countyStrategy} className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            Executive Book · County strategy →
          </Link>
          <Link href={COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.countyVictoryTargets} className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            County victory targets →
          </Link>
          <Link href="/election-plan/registration-goals" className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            Registration goals OS →
          </Link>
          <Link href="/election-plan/lanes-overview" className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            Four lanes overview →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COUNTY_PLAYBOOK_LAYERS.map((layer) => (
          <article key={layer.id} className="ep-card p-4">
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">{layer.label}</p>
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{layer.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly operator flow</h3>
          <ol className="mt-4 space-y-3 text-sm">
            {COUNTY_WEEKLY_OPERATOR_FLOW.map((item) => (
              <li key={item.step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ep-navy)] text-xs font-bold text-white">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-[var(--ep-navy)]">{item.title}</p>
                  <p className="mt-0.5 text-[var(--ep-navy-muted)]">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Mobilize county playbook</h3>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Field captains run this sequence after reading Ch. 9 field targets for their county.
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-[var(--ep-navy-muted)]">
            {MOBILIZE_COUNTY_PLAYBOOK_STEPS.map((step) => (
              <li key={step.slice(0, 40)}>{step}</li>
            ))}
          </ol>
        </article>
      </div>

      <article className="ep-card p-5">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Tier guidance (all 75 counties)</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(COUNTY_TIER_GUIDANCE).map(([tier, text]) => (
            <div key={tier} className="rounded-lg border border-[var(--ep-border)] bg-white p-3 text-xs">
              <p className="font-bold text-[var(--ep-navy)]">Tier {tier}</p>
              <p className="mt-1 text-[var(--ep-navy-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
