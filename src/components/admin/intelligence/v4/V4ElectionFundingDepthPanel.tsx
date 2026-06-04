import Link from "next/link";
import {
  ELECTION_FUNDING_DEPTH_SECTIONS,
  getElectionFundingDepthSection,
  type ElectionFundingDepthSection,
} from "@/lib/intelligence/v4/electionFundingDrillDownDepth";

const TIER_STYLE: Record<string, string> = {
  VERIFIED: "bg-emerald-100 text-emerald-900",
  PARTIAL: "bg-amber-100 text-amber-900",
  STRATEGY: "bg-violet-100 text-violet-900",
  NEEDS_RESEARCH: "bg-rose-100 text-rose-900",
};

function DepthSectionCard({ section, expanded }: { section: ElectionFundingDepthSection; expanded?: boolean }) {
  return (
    <article id={section.sectionId} className="scroll-mt-24 rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-900">{section.eyebrow}</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{section.title}</h3>
        </div>
        <Link
          href={`/admin/intelligence/election-funding/${section.sectionId}`}
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Full page →
        </Link>
      </div>

      <div className="mt-4 space-y-3 leading-relaxed text-kelly-text">
        {(expanded ? section.narrativeOverview : section.narrativeOverview.slice(0, 2)).map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
        {!expanded && section.narrativeOverview.length > 2 ? (
          <p className="text-[10px] font-bold text-kelly-muted">+ {section.narrativeOverview.length - 2} more paragraphs on full page</p>
        ) : null}
      </div>

      <p className="mt-4 rounded-lg border border-sky-100 bg-sky-50/50 p-3 text-sky-950">
        <span className="font-bold">Why Kelly should care:</span> {section.whyItMattersForKelly}
      </p>

      {expanded ? (
        <>
          <SectionBlock title="Plain English walkthrough" items={section.plainEnglishWalkthrough} />
          <SectionBlock title="Hard evidence" items={section.hardEvidence.map((e) => `${e.claim} [${e.tier}]`)} />
          <SectionBlock title="What we still need" items={section.whatWeStillNeed} />
          <SectionBlock title="On stage" items={section.howToPresentOnStage} />
          <SectionBlock title="On the trail" items={section.howToPresentOnTrail} />
          <SectionBlock title="Hammer record connection" items={section.connectToHammerRecord} />
          {section.rehearsalPrompt ? (
            <p className="mt-4 rounded-lg border border-kelly-gold/40 bg-kelly-page/50 p-3 italic text-kelly-navy">
              Rehearsal: {section.rehearsalPrompt}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {section.href ? (
              <Link href={section.href} className="font-bold text-violet-950 underline">
                Related route →
              </Link>
            ) : null}
            {section.relatedSectionIds.slice(0, 3).map((id) => {
              const rel = getElectionFundingDepthSection(id);
              return rel ? (
                <Link key={id} href={`/admin/intelligence/election-funding/${id}`} className="text-kelly-navy underline">
                  {rel.title.slice(0, 40)}…
                </Link>
              ) : null;
            })}
          </div>
        </>
      ) : (
        <ul className="mt-4 list-inside list-disc text-kelly-muted">
          {section.hardEvidence.slice(0, 3).map((e) => (
            <li key={e.claim.slice(0, 48)}>
              <span className={`mr-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${TIER_STYLE[e.tier]}`}>{e.tier}</span>
              {e.claim.slice(0, 120)}
              {e.claim.length > 120 ? "…" : ""}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function SectionBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <p className="font-bold uppercase text-kelly-navy">{title}</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-kelly-muted">
        {items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Hub view — all sections with narrative previews */
export function V4ElectionFundingDepthHub() {
  return (
    <section className="space-y-4">
      <header className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">Deep narrative drill-down</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">
          Election funding — every section explained
        </h2>
        <p className="mt-2 text-sm text-kelly-muted">
          {ELECTION_FUNDING_DEPTH_SECTIONS.length} sections with multi-paragraph narratives, evidence tiers, stage/trail
          guidance, and staff research gaps. Open any section for the full read.
        </p>
      </header>
      {ELECTION_FUNDING_DEPTH_SECTIONS.map((section) => (
        <DepthSectionCard key={section.sectionId} section={section} />
      ))}
    </section>
  );
}

/** Single-section full page */
export function V4ElectionFundingDepthSectionPanel({ sectionId }: { sectionId: string }) {
  const section = getElectionFundingDepthSection(sectionId);
  if (!section) {
    return <p className="text-sm text-rose-900">Section not found.</p>;
  }
  return (
    <div className="space-y-4">
      <Link href="/admin/intelligence/election-funding" className="text-xs font-bold text-kelly-navy underline">
        ← Election funding hub
      </Link>
      <DepthSectionCard section={section} expanded />
    </div>
  );
}
