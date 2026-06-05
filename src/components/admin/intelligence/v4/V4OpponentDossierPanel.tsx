import Link from "next/link";
import {
  getOpponentDossierSection,
  getOpponentDossierSectionsForCandidate,
  OPPONENT_DOSSIER_SECTIONS,
  type OpponentDossierDepthSection,
} from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import {
  loadCandidateDossier,
  OPPONENT_DOSSIER_CANDIDATES,
  type CandidateDossierFile,
} from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import { PackoContrastGateBanner } from "@/components/admin/intelligence/PackoContrastGateBanner";
import { isPackoContrastBlocked } from "@/lib/intelligence/v4/packoContrastGate";
import {
  buildHammerBioNarrativeChapter,
  buildOpponentSectionReadAloud,
  buildPakkoBioNarrativeChapter,
} from "@/lib/intelligence/v4/candidateDossierBriefingBook";
import {
  BioNarrativeChapterPanel,
  BriefingBookOrientationBanner,
  DossierStickySectionNav,
  SectionReadAloudPanel,
} from "@/components/admin/intelligence/v4/CandidateDossierBriefingBookChrome";

const TIER_STYLE: Record<string, string> = {
  VERIFIED: "bg-emerald-100 text-emerald-900",
  PARTIAL: "bg-amber-100 text-amber-900",
  STRATEGY: "bg-violet-100 text-violet-900",
  NEEDS_RESEARCH: "bg-rose-100 text-rose-900",
};

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

function DossierSectionCard({
  section,
  expanded,
}: {
  section: OpponentDossierDepthSection;
  expanded?: boolean;
}) {
  const sectionHref = `/admin/intelligence/opponents/dossiers/${section.candidateId}/${section.sectionId}`;

  return (
    <article id={section.sectionId} className="scroll-mt-24 rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-900">{section.eyebrow}</p>
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

      <p className="mt-4 rounded-lg border border-sky-100 bg-sky-50/50 p-3 text-sky-950">
        <span className="font-bold">Why Kelly should care:</span> {section.whyItMattersForKelly}
      </p>

      <SectionReadAloudPanel {...buildOpponentSectionReadAloud(section)} />

      {expanded ? (
        <>
          <SectionBlock title="Plain English walkthrough" items={section.plainEnglishWalkthrough} />
          <SectionBlock title="Hard evidence" items={section.hardEvidence.map((e) => `${e.claim} [${e.tier}]`)} />
          <SectionBlock title="What we still need" items={section.whatWeStillNeed} />
          <SectionBlock title="In debate / panel" items={section.howToUseInDebate} />
          <SectionBlock title="In clerk rooms" items={section.howToUseInClerkRoom} />
          <SectionBlock title="Do not say" items={section.doNotSay} />
          <div className="mt-4 flex flex-wrap gap-2">
            {section.href ? (
              <Link href={section.href} className="font-bold text-violet-950 underline">
                Related route →
              </Link>
            ) : null}
            {section.relatedSectionIds.slice(0, 3).map((id) => {
              const rel = getOpponentDossierSection(id);
              return rel ? (
                <Link
                  key={id}
                  href={`/admin/intelligence/opponents/dossiers/${rel.candidateId}/${id}`}
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

function ClaimsTable({ dossier }: { dossier: CandidateDossierFile }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="mb-2 font-bold uppercase text-kelly-navy">What they claim</p>
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="border-b border-kelly-text/10 text-kelly-subtle">
            <th className="py-2 pr-2">Claim</th>
            <th className="py-2 pr-2">Tier</th>
            <th className="py-2">Kelly frame</th>
          </tr>
        </thead>
        <tbody>
          {dossier.whatTheyClaim.map((c) => (
            <tr key={c.claim.slice(0, 40)} className="border-b border-kelly-text/5 align-top">
              <td className="py-2 pr-2">{c.claim}</td>
              <td className="py-2 pr-2">
                <span className={`rounded px-1 py-0.5 text-[9px] font-bold uppercase ${TIER_STYLE[c.evidenceStatus] ?? "bg-gray-100"}`}>
                  {c.evidenceStatus}
                </span>
              </td>
              <td className="py-2 text-kelly-muted">{c.kellyRebuttalFrame ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadStoriesBlock({ dossier }: { dossier: CandidateDossierFile }) {
  return (
    <div className="mt-6">
      <p className="font-bold uppercase text-kelly-navy">Lead stories to watch</p>
      <ul className="mt-3 space-y-3">
        {dossier.leadStoriesToWatch.map((s) => (
          <li key={s.id} className="rounded-lg border border-kelly-text/10 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                  s.priority === "CRITICAL" ? "bg-rose-100 text-rose-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {s.priority}
              </span>
              {s.dateContext ? <span className="text-[10px] text-kelly-muted">{s.dateContext}</span> : null}
            </div>
            <p className="mt-1 font-bold text-kelly-navy">{s.headline}</p>
            <p className="mt-1 text-kelly-muted">{s.watchFor}</p>
            {s.href ? (
              <Link href={s.href} className="mt-2 inline-block text-[10px] font-bold text-violet-950 underline">
                Prep module →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function V4OpponentDossiersHub() {
  return (
    <section className="space-y-6">
      <header className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">Opponent dossiers</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Complete candidate profiles — strengths, claims, lead stories</h2>
        <p className="mt-2 text-sm text-kelly-muted">
          {OPPONENT_DOSSIER_SECTIONS.length} narrative sections across {OPPONENT_DOSSIER_CANDIDATES.length} opponents.
          Hammer production-ready; Pakko expanded from media catalog + Ballotpedia + campaign site.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {OPPONENT_DOSSIER_CANDIDATES.map((c) => (
          <Link
            key={c.candidateId}
            href={c.href}
            className="rounded-xl border-2 border-kelly-navy/15 bg-white p-5 shadow-sm transition hover:border-kelly-navy"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[c.status] ?? ""}`}>
                {c.status}
              </span>
              <span className="text-[10px] font-bold text-kelly-subtle">{c.party}</span>
            </div>
            <h3 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{c.displayName}</h3>
            <p className="mt-2 text-sm text-kelly-muted">
              {getOpponentDossierSectionsForCandidate(c.candidateId).length} dossier sections · claims ledger · lead
              stories watch list
            </p>
            <p className="mt-3 text-xs font-bold text-kelly-navy">Open dossier →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function V4OpponentCandidateDossierPanel({ candidateId }: { candidateId: "kim-hammer" | "michael-packo" }) {
  const dossier = loadCandidateDossier(candidateId);
  const sections = getOpponentDossierSectionsForCandidate(candidateId);
  const packoBlocked = candidateId === "michael-packo" && isPackoContrastBlocked();
  const bioChapter =
    candidateId === "kim-hammer" ? buildHammerBioNarrativeChapter() : buildPakkoBioNarrativeChapter();
  const sectionNav = sections.map((s) => ({
    sectionId: s.sectionId,
    title: s.title,
    href: `/admin/intelligence/opponents/dossiers/${candidateId}/${s.sectionId}`,
  }));

  return (
    <div className="space-y-6">
      <Link href="/admin/intelligence/candidate-dossiers" className="text-xs font-bold text-kelly-navy underline">
        ← All candidate dossiers
      </Link>

      <BriefingBookOrientationBanner />

      {packoBlocked ? <PackoContrastGateBanner /> : null}

      <header className="rounded-xl border-2 border-kelly-navy/20 bg-gradient-to-br from-kelly-page/50 to-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[dossier.dossierStatus] ?? ""}`}>
            {dossier.dossierStatus}
          </span>
          <span className="text-[10px] font-bold text-kelly-subtle">{dossier.party}</span>
        </div>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{dossier.displayName}</h2>
        <p className="mt-1 text-sm text-violet-900">{dossier.office}</p>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{dossier.executiveSummary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(dossier.relatedRoutes).slice(0, 4).map(([k, href]) => (
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

      <ClaimsTable dossier={dossier} />
      <LeadStoriesBlock dossier={dossier} />

      {packoBlocked ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-950">
          Narrative sections below are for staff research only — contrast and attack framing locked until PACKO-01/02
          complete.
        </p>
      ) : null}

      {dossier.researchGaps?.length ? (
        <div className="rounded-lg border border-rose-100 bg-rose-50/30 p-4 text-xs">
          <p className="font-bold text-rose-950">Research gaps</p>
          <ul className="mt-2 list-inside list-disc text-rose-900/90">
            {dossier.researchGaps.map((g) => (
              <li key={g.slice(0, 40)}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">
          {sections.length} narrative sections
        </p>
        {sections.map((section) => (
          <DossierSectionCard key={section.sectionId} section={section} expanded />
        ))}
      </div>
    </div>
  );
}

export function V4OpponentDossierSectionPanel({ sectionId }: { sectionId: string }) {
  const section = getOpponentDossierSection(sectionId);
  if (!section) return <p className="text-sm text-rose-900">Section not found.</p>;

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/intelligence/opponents/dossiers/${section.candidateId}`}
        className="text-xs font-bold text-kelly-navy underline"
      >
        ← {section.candidateId === "kim-hammer" ? "Kim Hammer" : "Michael Pakko"} dossier
      </Link>
      <DossierSectionCard section={section} expanded />
    </div>
  );
}
