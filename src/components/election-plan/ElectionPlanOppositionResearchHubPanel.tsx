import Link from "next/link";

import { KimHammerModuleNavPanel } from "@/components/admin/intelligence/KimHammerModuleNavPanel";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { listOppositionResearchModules, resolveOppositionResearchHref } from "@/lib/election-plan/oppositionResearchModules";
import {
  EP_DEBATE_PREP_HREF,
  EP_EXECUTIVE_BOOK_HREF,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";

export function ElectionPlanOppositionResearchHubPanel() {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const modules = listOppositionResearchModules(v4);
  const highlightModules = modules.filter((m) => m.id !== "claims-ledger");

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-800">Opposition research · Election Plan</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Kim Hammer &amp; opponent intelligence</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          Staff research lane — bills, debate profile, dossiers, and evidence governance. Kelly rehearses contrast in{" "}
          <Link href={EP_DEBATE_PREP_HREF} className="font-semibold text-[var(--ep-navy)] underline">
            Debate Prep
          </Link>
          ; verify every line against the{" "}
          <Link href={epOppositionResearchModuleHref("claims-ledger")} className="font-semibold underline">
            claims ledger
          </Link>{" "}
          before broadcast.
        </p>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={epOppositionResearchModuleHref("themes")} className="ep-stat block transition hover:border-[var(--ep-gold)]">
          <div className="ep-stat-value">{v4.hub.totalBills}</div>
          <div className="ep-stat-label">Bills indexed →</div>
        </Link>
        <Link href={epOppositionResearchModuleHref("timeline")} className="ep-stat block transition hover:border-[var(--ep-gold)]">
          <div className="ep-stat-value">{v4.timeline.length}</div>
          <div className="ep-stat-label">Timeline events →</div>
        </Link>
        <Link href={epOppositionResearchModuleHref("themes")} className="ep-stat block transition hover:border-[var(--ep-gold)]">
          <div className="ep-stat-value">{v4.themeMatrix.length}</div>
          <div className="ep-stat-label">Theme lanes →</div>
        </Link>
        <Link
          href={epOppositionResearchModuleHref("claims-ledger")}
          className="ep-stat block transition hover:border-amber-400"
        >
          <div className="ep-stat-value text-amber-800">{v4.hub.claims.needsResearch.length}</div>
          <div className="ep-stat-label">Claims to verify →</div>
        </Link>
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlightModules.slice(0, 6).map((mod) => (
          <Link
            key={mod.id}
            href={mod.epHref}
            className="ep-card flex flex-col p-4 transition hover:border-[var(--ep-gold)] hover:shadow-sm"
          >
            <h2 className="font-heading text-base font-bold text-[var(--ep-navy)]">{mod.title}</h2>
            <p className="mt-2 flex-1 text-xs text-[var(--ep-navy-muted)]">{mod.summary}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-rose-800">Open drill-down →</p>
          </Link>
        ))}
      </section>

      {v4.integrity2021 ? (
        <Link
          href={epOppositionResearchModuleHref("integrity-foundation-2021")}
          className="ep-card mb-8 block border border-violet-200 bg-violet-50/40 p-5 transition hover:border-violet-400"
        >
          <h2 className="text-sm font-bold uppercase text-violet-950">2021 integrity foundation</h2>
          <p className="mt-2 text-sm text-violet-950">{v4.integrity2021.plainEnglishSummary}</p>
          <p className="mt-3 text-xs font-bold text-violet-900">Full package drill-down →</p>
        </Link>
      ) : null}

      <KimHammerModuleNavPanel resolveHref={(href) => resolveOppositionResearchHref(href, v4)} />

      <section className="mt-10 ep-card p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Executive Book crosswalk</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Opposition contrast and clerk-room vocabulary feed leadership chapters — especially conversation strategy and
          immersion missions.
        </p>
        <Link href={EP_EXECUTIVE_BOOK_HREF} className="ep-chapter-link mt-3 inline-block">
          Open Executive Book →
        </Link>
      </section>
    </>
  );
}
