import Link from "next/link";

import { KimHammerModuleNavPanel } from "@/components/admin/intelligence/KimHammerModuleNavPanel";
import { ElectionPlanPakkoOppositionPanel } from "@/components/election-plan/ElectionPlanPakkoOppositionPanel";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { PETITION_2025_CLUSTER_DEPTH } from "@/lib/intelligence/v4/integrityPackageDepth";
import { loadOppositionResearchCandidateBrief } from "@/lib/election-plan/load-opposition-research-candidate-brief";
import { listOppositionResearchModules, resolveOppositionResearchHref } from "@/lib/election-plan/oppositionResearchModules";
import {
  EP_DEBATE_PREP_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_OPPOSITION_DEBATE_NIGHT_HREF,
  epLegislativeIntel2025Href,
  epOpponentBioHref,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  OPPOSITION_RESEARCH_RELEASE_LABEL,
  OPPOSITION_RESEARCH_RELEASE_VERSION,
} from "@/lib/election-plan/opposition-research-release";

export function ElectionPlanOppositionResearchHubPanel() {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const brief = loadOppositionResearchCandidateBrief();
  const modules = listOppositionResearchModules(v4);
  const kellyPaths = brief.readingPaths.filter((p) => p.audience === "kelly");
  const hammerModules = modules.filter(
    (m) => !["dossier-pakko", "pakko-quotes", "three-way-geometry", "debate-night"].includes(m.id),
  );
  const pakkoModules = modules.filter((m) =>
    ["dossier-pakko", "pakko-quotes", "three-way-geometry"].includes(m.id),
  );

  return (
    <>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-800">Opposition research · v2.0</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Hammer, Pakko &amp; three-way prep</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          Kelly starts at the debate night card. Staff drills into bills, claims, and dossiers — same intelligence, two
          reading speeds.
        </p>
      </header>

      <KellyPageSummary summary={brief.kellyOneLiner} label="Kelly · start here" />

      <Link
        href={EP_OPPOSITION_DEBATE_NIGHT_HREF}
        className="ep-card mb-8 block border-2 border-[var(--ep-gold)] bg-[var(--ep-cream)]/40 p-6 transition hover:border-[var(--ep-navy)]"
      >
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Primary · 5 minutes</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Debate night card</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {brief.stats.exportReadyClaimCount} export-ready Hammer lines · {brief.topHammerRebuttals.length} rebuttals ·{" "}
          {brief.stats.pakkoQuoteCount} Pakko quotes · do-not-say lists
        </p>
        <p className="mt-4 text-sm font-bold text-[var(--ep-navy)]">Open debate night card →</p>
      </Link>

      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Kelly reading paths</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kellyPaths.map((path) => (
            <Link
              key={path.id}
              href={path.href}
              className="ep-card flex flex-col p-4 transition hover:border-[var(--ep-gold)]"
            >
              <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">
                {path.minutes > 0 ? `${path.minutes} min` : "When ready"}
              </p>
              <h3 className="mt-1 font-heading font-bold text-[var(--ep-navy)]">{path.label}</h3>
              <ul className="mt-2 flex-1 list-inside list-disc text-xs text-[var(--ep-navy-muted)]">
                {path.steps.map((s) => (
                  <li key={s.slice(0, 32)}>{s}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={epOppositionResearchModuleHref("export-ready-lines")} className="ep-stat block transition hover:border-emerald-400">
          <div className="ep-stat-value text-emerald-800">{brief.stats.exportReadyClaimCount}</div>
          <div className="ep-stat-label">Export-ready lines →</div>
        </Link>
        <Link href={epOppositionResearchModuleHref("themes")} className="ep-stat block transition hover:border-[var(--ep-gold)]">
          <div className="ep-stat-value">{v4.hub.totalBills}</div>
          <div className="ep-stat-label">Hammer bills →</div>
        </Link>
        <Link href={epOppositionResearchModuleHref("pakko-quotes")} className="ep-stat block transition hover:border-indigo-400">
          <div className="ep-stat-value text-indigo-800">{brief.stats.pakkoQuoteCount}</div>
          <div className="ep-stat-label">Pakko quotes →</div>
        </Link>
        <Link href={epOppositionResearchModuleHref("claims-ledger")} className="ep-stat block transition hover:border-amber-400">
          <div className="ep-stat-value text-amber-800">{brief.stats.reviewNeededClaimCount}</div>
          <div className="ep-stat-label">Staff review queue →</div>
        </Link>
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Kim Hammer · primary opponent</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Legislative record, debate profile, bill drill-down</p>
          <div className="mt-3 grid gap-2">
            {hammerModules.slice(0, 6).map((mod) => (
              <Link
                key={mod.id}
                href={mod.epHref}
                className="ep-card p-3 text-sm transition hover:border-rose-300"
              >
                <span className="font-bold text-[var(--ep-navy)]">{mod.title}</span>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{mod.summary}</p>
              </Link>
            ))}
          </div>
          <Link href={epOpponentBioHref("kim-hammer")} className="mt-3 inline-block text-xs font-bold underline">
            Full Hammer biography →
          </Link>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Michael Pakko · third candidate</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Respect on stage · reform pivot · contrast gate</p>
          <div className="mt-3 grid gap-2">
            {pakkoModules.map((mod) => (
              <Link
                key={mod.id}
                href={mod.epHref}
                className="ep-card p-3 text-sm transition hover:border-indigo-300"
              >
                <span className="font-bold text-[var(--ep-navy)]">{mod.title}</span>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{mod.summary}</p>
              </Link>
            ))}
          </div>
          <Link href={epOpponentBioHref("michael-packo")} className="mt-3 inline-block text-xs font-bold underline">
            Full Pakko biography →
          </Link>
        </section>
      </div>

      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Pakko quick brief</h2>
        <ElectionPlanPakkoOppositionPanel variant="hub" />
      </section>

      {v4.integrity2021 ? (
        <Link
          href={epOppositionResearchModuleHref("integrity-foundation-2021")}
          className="ep-card mb-4 block border border-violet-200 bg-violet-50/40 p-5 transition hover:border-violet-400"
        >
          <h2 className="text-sm font-bold uppercase text-violet-950">2021 integrity foundation</h2>
          <p className="mt-2 text-sm text-violet-950">{v4.integrity2021.plainEnglishSummary}</p>
        </Link>
      ) : null}

      <Link
        href={epLegislativeIntel2025Href()}
        className="ep-card mb-8 block border border-amber-200 bg-amber-50/40 p-5 transition hover:border-amber-400"
      >
        <h2 className="text-sm font-bold uppercase text-amber-950">2025 direct democracy bills</h2>
        <p className="mt-2 text-sm text-amber-950">{PETITION_2025_CLUSTER_DEPTH.plainEnglishSummary}</p>
      </Link>

      <nav className="mb-6 flex flex-wrap gap-2 text-xs font-bold">
        <Link href={EP_DEBATE_PREP_HREF} className="rounded-full border border-[var(--ep-navy)] px-3 py-1">
          Debate prep hub →
        </Link>
        <Link href={EP_OPPONENT_BIOS_HREF} className="rounded-full border border-[var(--ep-navy)] px-3 py-1">
          Opponent bios →
        </Link>
      </nav>

      <KimHammerModuleNavPanel resolveHref={(href) => resolveOppositionResearchHref(href, v4)} />

      <p className="mt-6 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {OPPOSITION_RESEARCH_RELEASE_VERSION} · {OPPOSITION_RESEARCH_RELEASE_LABEL}
      </p>
    </>
  );
}
