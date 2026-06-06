import Link from "next/link";
import {
  getKellyDossierSection,
  getKellyDossierSections,
  type KellyDossierDepthSection,
} from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import {
  ALL_CANDIDATE_DOSSIER_ENTRIES,
  loadKellyGrappeCandidateDossier,
  type KellyCandidateDossierFile,
} from "@/lib/intelligence/v4/loadKellyCandidateDossier";
import {
  getOpponentDossierSectionsForCandidate,
} from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import { OPPONENT_DOSSIER_CANDIDATES } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import {
  buildKellyBioNarrativeChapter,
  buildKellySectionReadAloud,
} from "@/lib/intelligence/v4/candidateDossierBriefingBook";
import {
  BioNarrativeChapterPanel,
  BriefingBookOrientationBanner,
  DossierStickySectionNav,
  SectionReadAloudPanel,
} from "@/components/admin/intelligence/v4/CandidateDossierBriefingBookChrome";

const STATUS_STYLE: Record<string, string> = {
  PRODUCTION: "bg-emerald-100 text-emerald-900",
  PARTIAL_VERIFIED: "bg-amber-100 text-amber-900",
};

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

function ResearchDepthPanel({ researchDepth }: { researchDepth?: { sourcedFacts: string[]; fieldResearchNotes: string[] } }) {
  if (!researchDepth?.sourcedFacts.length && !researchDepth?.fieldResearchNotes.length) return null;
  return (
    <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-950">Research depth</p>
      {researchDepth.sourcedFacts.length ? (
        <SectionBlock title="Sourced facts" items={researchDepth.sourcedFacts} />
      ) : null}
      {researchDepth.fieldResearchNotes.length ? (
        <SectionBlock title="Field research notes" items={researchDepth.fieldResearchNotes} />
      ) : null}
    </div>
  );
}

function KellyDossierSectionCard({
  section,
  expanded,
}: {
  section: KellyDossierDepthSection;
  expanded?: boolean;
}) {
  const sectionHref = `/admin/intelligence/candidate-dossiers/kelly-grappe/${section.sectionId}`;

  return (
    <article id={section.sectionId} className="scroll-mt-24 rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900">{section.eyebrow}</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{section.title}</h3>
        </div>
        <Link
          href={sectionHref}
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
          <p className="text-[10px] font-bold text-kelly-muted">
            + {section.narrativeOverview.length - 2} more paragraphs on full page
          </p>
        ) : null}
      </div>

      <blockquote className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 italic text-emerald-950">
        <span className="not-italic font-bold">Debate framing example:</span> {section.debateFramingExample}
      </blockquote>

      <SectionReadAloudPanel
        {...buildKellySectionReadAloud(section.debateFramingExample, section.howToUseInDebate)}
      />

      {expanded ? (
        <>
          <ResearchDepthPanel researchDepth={section.researchDepth} />
          <SectionBlock title="Relevant SOS functions" items={section.relevantSosFunctions} />
          <SectionBlock title="Experience highlights" items={section.experienceHighlights} />
          <SectionBlock title="Plain English walkthrough" items={section.plainEnglishWalkthrough} />
          <SectionBlock title="In debate / panel" items={section.howToUseInDebate} />
          <SectionBlock title="On the campaign trail" items={section.howToUseOnTrail} />
          <SectionBlock title="What not to do" items={section.whatNotToDo} />
          <div className="mt-4 flex flex-wrap gap-2">
            {section.href ? (
              <Link href={section.href} className="font-bold text-emerald-950 underline">
                Related prep module →
              </Link>
            ) : null}
            {section.relatedSectionIds.slice(0, 4).map((id) => {
              const rel = getKellyDossierSection(id);
              return rel ? (
                <Link
                  key={id}
                  href={`/admin/intelligence/candidate-dossiers/kelly-grappe/${id}`}
                  className="text-kelly-navy underline"
                >
                  {rel.title.slice(0, 44)}…
                </Link>
              ) : null;
            })}
          </div>
        </>
      ) : null}
    </article>
  );
}

function ExperienceCrosswalkTable({ dossier }: { dossier: KellyCandidateDossierFile }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <p className="mb-2 font-bold uppercase text-kelly-navy">Experience-to-office crosswalk</p>
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="border-b border-kelly-text/10 text-kelly-subtle">
            <th className="py-2 pr-2">Experience theme</th>
            <th className="py-2 pr-2">SOS functions</th>
            <th className="py-2">Debate line</th>
          </tr>
        </thead>
        <tbody>
          {dossier.experienceToOfficeThemes.map((row) => (
            <tr key={row.theme} className="border-b border-kelly-text/5 align-top">
              <td className="py-2 pr-2 font-bold text-kelly-navy">{row.theme}</td>
              <td className="py-2 pr-2 text-kelly-muted">{row.sosFunctions.join(" · ")}</td>
              <td className="py-2 italic text-kelly-text">{row.debateLine}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThirtySecondBioBlock({ dossier }: { dossier: KellyCandidateDossierFile }) {
  const { past, present, future } = dossier.thirtySecondBioFramework;
  return (
    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
      <p className="font-bold uppercase text-emerald-950">30-second biography framework</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Past</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-text">
            {past.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Present</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-text">
            {present.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Future</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-text">
            {future.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CoreStrengthsBlock({ dossier }: { dossier: KellyCandidateDossierFile }) {
  return (
    <div className="mt-6">
      <p className="font-bold uppercase text-kelly-navy">Core strengths — how to say them</p>
      <ul className="mt-3 space-y-3">
        {dossier.coreStrengths.map((s) => (
          <li key={s.id} className="rounded-lg border border-kelly-text/10 bg-white p-3">
            <p className="font-bold text-kelly-navy">{s.strength}</p>
            <p className="mt-1 text-[10px] text-kelly-subtle">{s.evidenceStatus}</p>
            <p className="mt-2 italic text-kelly-muted">{s.debateUse}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Unified hub — Kelly + Hammer + Pakko */
export function V4AllCandidateDossiersHub() {
  return (
    <section className="space-y-6">
      <header className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-950">Candidate dossiers</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">
          Single-page readouts for every SOS candidate — experience alignment, opponent contrast, drill-down depth
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-kelly-muted">
          Kelly&apos;s Experience-to-Office Alignment Profile is written for you to read before debate — narrative bridges
          from lived experience to SOS duties, not résumé recitation. Hammer and Pakko dossiers cover strengths, claims,
          and lead stories for contrast prep. Tap any card for the full single-page readout, then open section drill-downs.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {ALL_CANDIDATE_DOSSIER_ENTRIES.map((c) => {
          const sectionCount =
            c.candidateId === "kelly-grappe"
              ? getKellyDossierSections().length
              : getOpponentDossierSectionsForCandidate(
                  c.candidateId as "kim-hammer" | "michael-packo",
                ).length;
          const isKelly = c.candidateId === "kelly-grappe";
          return (
            <Link
              key={c.candidateId}
              href={c.href}
              className={`rounded-xl border-2 bg-white p-5 shadow-sm transition hover:border-kelly-navy ${
                isKelly ? "border-emerald-300 ring-1 ring-emerald-100" : "border-kelly-navy/15"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[c.status] ?? ""}`}>
                  {c.status}
                </span>
                <span className="text-[10px] font-bold text-kelly-subtle">{c.party}</span>
                {isKelly ? (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
                    Your profile
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{c.displayName}</h3>
              <p className="mt-2 text-sm text-kelly-muted">
                {sectionCount} narrative sections · {isKelly ? "experience-to-office alignment" : "claims + lead stories"}
              </p>
              <p className="mt-3 text-xs font-bold text-kelly-navy">Open dossier →</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function V4KellyCandidateDossierPanel() {
  const dossier = loadKellyGrappeCandidateDossier();
  const sections = getKellyDossierSections();
  const bioChapter = buildKellyBioNarrativeChapter();
  const sectionNav = sections.map((s) => ({
    sectionId: s.sectionId,
    title: s.title,
    href: `/admin/intelligence/candidate-dossiers/kelly-grappe/${s.sectionId}`,
  }));

  return (
    <div className="space-y-6">
      <Link href="/admin/intelligence/candidate-dossiers" className="text-xs font-bold text-kelly-navy underline">
        ← All candidate dossiers
      </Link>

      <BriefingBookOrientationBanner />

      <header className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[dossier.dossierStatus] ?? ""}`}>
            {dossier.dossierStatus}
          </span>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
            {dossier.classification}
          </span>
          <span className="text-[10px] font-bold text-kelly-subtle">{dossier.party}</span>
        </div>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{dossier.displayName}</h2>
        <p className="mt-1 text-sm font-bold text-emerald-900">Experience-to-Office Alignment Profile</p>
        <p className="mt-1 text-sm text-violet-900">{dossier.office}</p>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{dossier.executiveSummary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(dossier.relatedRoutes).map(([k, href]) => (
            <Link
              key={k}
              href={href}
              className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
            >
              {k}
            </Link>
          ))}
        </div>
      </header>

      <BioNarrativeChapterPanel chapter={bioChapter} />

      <DossierStickySectionNav sections={sectionNav} />

      <ThirtySecondBioBlock dossier={dossier} />
      <CoreStrengthsBlock dossier={dossier} />
      <ExperienceCrosswalkTable dossier={dossier} />

      {dossier.researchGaps?.length ? (
        <div className="rounded-lg border border-amber-100 bg-amber-50/30 p-4 text-xs">
          <p className="font-bold text-amber-950">Before you claim it on stage</p>
          <ul className="mt-2 list-inside list-disc text-amber-900/90">
            {dossier.researchGaps.map((g) => (
              <li key={g.slice(0, 40)}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-950">
          {sections.length} alignment sections — read overview here, drill down for full narrative
        </p>
        {sections.map((section) => (
          <KellyDossierSectionCard key={section.sectionId} section={section} expanded />
        ))}
      </div>

      <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 text-xs">
        <p className="font-bold text-violet-950">Opponent contrast — open when ready</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {OPPONENT_DOSSIER_CANDIDATES.map((o) => (
            <Link
              key={o.candidateId}
              href={o.href}
              className="rounded-full border border-violet-200 px-3 py-1 font-bold text-violet-950"
            >
              {o.displayName} dossier →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function V4KellyDossierSectionPanel({ sectionId }: { sectionId: string }) {
  const section = getKellyDossierSection(sectionId);
  if (!section) return <p className="text-sm text-rose-900">Section not found.</p>;

  return (
    <div className="space-y-4">
      <Link
        href="/admin/intelligence/candidate-dossiers/kelly-grappe"
        className="text-xs font-bold text-kelly-navy underline"
      >
        ← Kelly Grappe alignment profile
      </Link>
      <KellyDossierSectionCard section={section} expanded />
    </div>
  );
}
