import Link from "next/link";
import {
  DEBATE_PSYCHOLOGY_MANUAL_SECTIONS,
  DEBATE_PSYCHOLOGY_MANUAL_SUMMARY,
  DEBATE_PSYCHOLOGY_MANUAL_TITLE,
  getDebatePsychologyManualSection,
  type DebatePsychologyManualSection,
} from "@/lib/intelligence/v4/debatePsychologyTrainingManual";

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

function ManualSectionCard({ section, expanded }: { section: DebatePsychologyManualSection; expanded?: boolean }) {
  return (
    <article id={section.sectionId} className="scroll-mt-24 rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-900">
            Part {section.partNumber} · {section.eyebrow}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{section.title}</h3>
          <p className="mt-1 text-[10px] font-bold text-kelly-gold">~{section.estimatedReadMinutes} min read</p>
        </div>
        <Link
          href={`/admin/intelligence/debate-prep/psychology-manual/${section.sectionId}`}
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

      {expanded ? (
        <>
          <SectionBlock title="Core principles" items={section.corePrinciples} />
          <SectionBlock title="Kelly application" items={section.kellyApplication} />
          {section.rehearsalScripts.length > 0 ? (
            <div className="mt-4 space-y-3">
              <p className="font-bold uppercase text-indigo-950">Rehearsal scripts</p>
              {section.rehearsalScripts.map((script) => (
                <article key={script.label} className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3">
                  <p className="font-bold text-indigo-950">{script.label}</p>
                  <p className="mt-2 italic leading-relaxed text-kelly-text">&ldquo;{script.text}&rdquo;</p>
                  <p className="mt-2 text-kelly-muted">
                    <span className="font-semibold text-kelly-navy">When:</span> {script.whenToUse}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
          <SectionBlock title="Common mistakes" items={section.commonMistakes} />
          <SectionBlock title="Opponent notes (Hammer · Pakko)" items={section.opponentNotes} />
          <SectionBlock title="Arkansas context" items={section.arkansasContext} />
          {section.citations.length > 0 ? (
            <div className="mt-4">
              <p className="font-bold uppercase text-emerald-950">Citations &amp; research</p>
              <ul className="mt-2 space-y-2">
                {section.citations.map((c) => (
                  <li key={c.label} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-kelly-muted">
                    <p className="font-bold text-emerald-950">{c.label}</p>
                    <p className="mt-1">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-kelly-navy underline">
                          {c.source}
                        </a>
                      ) : (
                        c.source
                      )}
                    </p>
                    <p className="mt-1">{c.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {section.href ? (
              <Link href={section.href} className="font-bold text-violet-950 underline">
                Related prep surface →
              </Link>
            ) : null}
            {section.linkedQuestionIds?.map((id) => (
              <Link
                key={id}
                href={`/admin/intelligence/sos-debate-questions/${id}`}
                className="text-kelly-navy underline"
              >
                SOS: {id.slice(0, 28)}…
              </Link>
            ))}
            {section.linkedBriefingIds?.map((id) => (
              <Link key={id} href={`/admin/intelligence/debate-briefings/${id}`} className="text-violet-900 underline">
                Briefing: {id}
              </Link>
            ))}
            {section.relatedSectionIds.slice(0, 3).map((id) => {
              const rel = getDebatePsychologyManualSection(id);
              return rel ? (
                <Link
                  key={id}
                  href={`/admin/intelligence/debate-prep/psychology-manual/${id}`}
                  className="text-kelly-navy underline"
                >
                  {rel.title.slice(0, 36)}…
                </Link>
              ) : null;
            })}
          </div>
        </>
      ) : (
        <ul className="mt-4 list-inside list-disc text-kelly-muted">
          {section.corePrinciples.slice(0, 2).map((p) => (
            <li key={p.slice(0, 48)}>{p}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

/** Hub — all psychology manual sections with narrative previews */
export function V4DebatePsychologyManualHub() {
  const totalMinutes = DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.reduce((n, s) => n + s.estimatedReadMinutes, 0);
  return (
    <section className="space-y-4">
      <header className="rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-50/80 to-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">
          Advanced candidate preparation · training manual
        </p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{DEBATE_PSYCHOLOGY_MANUAL_TITLE}</h2>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{DEBATE_PSYCHOLOGY_MANUAL_SUMMARY}</p>
        <p className="mt-3 text-xs text-kelly-muted">
          {DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.length} sections · ~{totalMinutes} minutes total read · Arkansas SOS
          three-way (Kelly · Hammer · Pakko) · citations where research-backed
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
          <Link
            href="/admin/intelligence/sos-debate-questions"
            className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-950"
          >
            Expected questions
          </Link>
          <Link
            href="/admin/intelligence/debate-briefings"
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-950"
          >
            Philosophy briefings
          </Link>
          <Link
            href="/admin/intelligence/opponents/dossiers"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-950"
          >
            Opponent dossiers
          </Link>
          <Link
            href="/admin/intelligence/kelly-debate-coaching"
            className="rounded-full border border-kelly-gold/50 bg-kelly-page/50 px-3 py-1 text-kelly-navy"
          >
            Kelly coaching
          </Link>
        </div>
      </header>
      {DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.map((section) => (
        <ManualSectionCard key={section.sectionId} section={section} />
      ))}
    </section>
  );
}

/** Full section page */
export function V4DebatePsychologyManualSectionPanel({ sectionId }: { sectionId: string }) {
  const section = getDebatePsychologyManualSection(sectionId);
  if (!section) return null;
  return <ManualSectionCard section={section} expanded />;
}
