import Link from "next/link";

import {
  epDebatePrepBriefingHref,
  epDebatePrepPsychologySectionHref,
  EP_DEBATE_PREP_BRIEFINGS_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import {
  DEBATE_PSYCHOLOGY_MANUAL_SECTIONS,
  DEBATE_PSYCHOLOGY_MANUAL_SUMMARY,
  DEBATE_PSYCHOLOGY_MANUAL_TITLE,
  getDebatePsychologyManualSection,
  type DebatePsychologyManualSection,
} from "@/lib/intelligence/v4/debatePsychologyTrainingManual";

function SectionList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">{title}</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
        {items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ElectionPlanPsychologyManualHub() {
  const totalMinutes = DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.reduce((n, s) => n + s.estimatedReadMinutes, 0);
  return (
    <section className="space-y-4">
      <article className="ep-card border-2 border-violet-300/40 bg-violet-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-900">Advanced candidate preparation</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{DEBATE_PSYCHOLOGY_MANUAL_TITLE}</h2>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{DEBATE_PSYCHOLOGY_MANUAL_SUMMARY}</p>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          {DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.length} sections · ~{totalMinutes} minutes total read
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={EP_DEBATE_PREP_BRIEFINGS_HREF} className="rounded-full border border-violet-300 px-3 py-1 text-xs font-bold text-violet-950">
            Philosophy briefings
          </Link>
        </div>
      </article>
      {DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.map((section) => (
        <PsychologySectionCard key={section.sectionId} section={section} />
      ))}
    </section>
  );
}

function PsychologySectionCard({
  section,
  expanded,
}: {
  section: DebatePsychologyManualSection;
  expanded?: boolean;
}) {
  return (
    <article className="ep-card p-5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase text-violet-900">
            Part {section.partNumber} · {section.eyebrow}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{section.title}</h3>
          <p className="mt-1 text-[10px] font-bold text-[var(--ep-gold)]">~{section.estimatedReadMinutes} min read</p>
        </div>
        {!expanded ? (
          <Link
            href={epDebatePrepPsychologySectionHref(section.sectionId)}
            className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[10px] font-bold text-[var(--ep-navy)]"
          >
            Full page →
          </Link>
        ) : null}
      </div>

      <div className="mt-4 space-y-3 leading-relaxed text-[var(--ep-navy-muted)]">
        {(expanded ? section.narrativeOverview : section.narrativeOverview.slice(0, 2)).map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50/50 p-3 text-sky-950">
        <span className="font-bold">Why Kelly should care:</span> {section.whyItMattersForKelly}
      </p>

      {expanded ? (
        <>
          <SectionList title="Core principles" items={section.corePrinciples} />
          <SectionList title="Kelly application" items={section.kellyApplication} />
          {section.rehearsalScripts.length > 0 ? (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase text-indigo-950">Rehearsal scripts</p>
              {section.rehearsalScripts.map((script) => (
                <article key={script.label} className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3">
                  <p className="font-bold text-indigo-950">{script.label}</p>
                  <p className="mt-2 italic leading-relaxed">&ldquo;{script.text}&rdquo;</p>
                  <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">When: {script.whenToUse}</p>
                </article>
              ))}
            </div>
          ) : null}
          <SectionList title="Common mistakes" items={section.commonMistakes} />
          <SectionList title="Opponent notes" items={section.opponentNotes} />
          <SectionList title="Arkansas context" items={section.arkansasContext} />
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            {section.href ? (
              <Link href={mapAdminHrefToElectionPlan(section.href)} className="underline text-violet-950">
                Related prep surface →
              </Link>
            ) : null}
            {section.linkedBriefingIds?.map((id) => (
              <Link key={id} href={epDebatePrepBriefingHref(id)} className="underline text-violet-900">
                Briefing: {id}
              </Link>
            ))}
            {section.relatedSectionIds.slice(0, 4).map((id) => {
              const rel = getDebatePsychologyManualSection(id);
              return rel ? (
                <Link key={id} href={epDebatePrepPsychologySectionHref(id)} className="underline text-[var(--ep-navy)]">
                  {rel.title.slice(0, 40)}…
                </Link>
              ) : null;
            })}
          </div>
        </>
      ) : null}
    </article>
  );
}

export function ElectionPlanPsychologyManualSectionPanel({ sectionId }: { sectionId: string }) {
  const section = getDebatePsychologyManualSection(sectionId);
  if (!section) return null;
  return <PsychologySectionCard section={section} expanded />;
}
