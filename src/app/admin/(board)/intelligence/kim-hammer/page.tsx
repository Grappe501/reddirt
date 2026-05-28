import { KimHammerBriefingHub } from "./KimHammerBriefingHub";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerNarrativeBriefings } from "@/lib/opposition/kimHammerNarrativeBriefings";
import { KimHammerNarrativePanel } from "./KimHammerNarrativePanel";

export default async function KimHammerCommandCenterPage() {
  const index = loadKimHammerEvidenceIndex();
  const strategic = loadKimHammerNarrativeBriefings();
  const morningBrief = strategic.sections.find((s) => s.id === "morning-brief");
  const debateTheater = strategic.sections.find((s) => s.id === "debate-theater");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-8 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          Kim Hammer Opposition Command Center
        </p>
        <h1 className="font-heading text-2xl font-bold lg:text-3xl">Nested Intelligence Briefing Hub</h1>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-kelly-muted">
          Every module below summarizes its full research layer in narrative form first — drill into any module for
          the complete briefing plus raw records. Summaries bubble up by domain (KH-0 through KH-4) so this page
          is the single orientation surface for the entire workbench.
        </p>
      </header>

      {morningBrief ? <KimHammerNarrativePanel section={morningBrief} variant="hero" /> : null}

      <KimHammerBriefingHub />

      {debateTheater ? (
        <details className="mt-10 rounded-xl border border-kelly-text/10 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold uppercase tracking-wider text-kelly-navy">
            Strategic synthesis — debate theater (expanded)
          </summary>
          <div className="mt-4">
            <KimHammerNarrativePanel section={debateTheater} />
          </div>
        </details>
      ) : null}

      <p className="mt-8 text-[10px] uppercase tracking-wider text-kelly-subtle">
        Index snapshot: {index.metrics.exportReadyClaims} export-ready · {index.metrics.blockedClaims} blocked ·{" "}
        {index.metrics.reviewNeededClaims} review-needed · generated {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
