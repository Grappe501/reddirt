import Link from "next/link";

import { KimHammerModuleNavPanel } from "@/components/admin/intelligence/KimHammerModuleNavPanel";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { buildKimHammerCommandCenterNavModules } from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import { EP_DEBATE_PREP_HREF, EP_EXECUTIVE_BOOK_HREF } from "@/lib/election-plan/debate-prep-links";

export function ElectionPlanOppositionResearchHubPanel() {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const highlights = buildKimHammerCommandCenterNavModules(v4);

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
          ; verify every line against the claims ledger before broadcast. Deep module workbenches migrate here from legacy
          admin routes in upcoming passes.
        </p>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ep-stat">
          <div className="ep-stat-value">{v4.hub.totalBills}</div>
          <div className="ep-stat-label">Bills indexed</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{v4.timeline.length}</div>
          <div className="ep-stat-label">Timeline events</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{v4.themeMatrix.length}</div>
          <div className="ep-stat-label">Theme lanes</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-amber-800">{v4.hub.claims.needsResearch.length}</div>
          <div className="ep-stat-label">Claims to verify</div>
        </div>
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.slice(0, 6).map((mod) => (
          <article key={mod.id} className="ep-card flex flex-col p-4">
            <h2 className="font-heading text-base font-bold text-[var(--ep-navy)]">{mod.title}</h2>
            <p className="mt-2 flex-1 text-xs text-[var(--ep-navy-muted)]">{mod.summary}</p>
            <p className="mt-3 text-[10px] font-mono text-[var(--ep-navy-muted)]">{mod.href}</p>
            <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">
              Full Election Plan module pages roll out next — open via Debate Prep cross-links or staff intelligence routes
              until mirrored.
            </p>
          </article>
        ))}
      </section>

      {v4.integrity2021 ? (
        <section className="ep-card mb-8 border border-violet-200 bg-violet-50/40 p-5">
          <h2 className="text-sm font-bold uppercase text-violet-950">2021 integrity foundation</h2>
          <p className="mt-2 text-sm text-violet-950">{v4.integrity2021.plainEnglishSummary}</p>
        </section>
      ) : null}

      <KimHammerModuleNavPanel />

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
