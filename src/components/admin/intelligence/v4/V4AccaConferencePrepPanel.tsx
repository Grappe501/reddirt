import Link from "next/link";
import {
  ACCA_CONFERENCE_DEPTH_SECTIONS,
  getAccaConferenceDepthSection,
  loadAccaClerksConference2026,
  type AccaConferenceDepthSection,
} from "@/lib/intelligence/v4/accaClerksConference2026Depth";

const TIER_STYLE: Record<string, string> = {
  VERIFIED: "bg-emerald-100 text-emerald-900",
  PARTIAL: "bg-amber-100 text-amber-900",
  STRATEGY: "bg-violet-100 text-violet-900",
  NEEDS_RESEARCH: "bg-rose-100 text-rose-900",
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

function DepthSectionCard({ section, expanded }: { section: AccaConferenceDepthSection; expanded?: boolean }) {
  return (
    <article id={section.sectionId} className="scroll-mt-24 rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-900">{section.eyebrow}</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{section.title}</h3>
        </div>
        <Link
          href={`/admin/intelligence/county-clerk-week/acca-summer-conference/${section.sectionId}`}
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
          <SectionBlock title="Plain English walkthrough" items={section.plainEnglishWalkthrough} />
          <SectionBlock title="Hard evidence" items={section.hardEvidence.map((e) => `${e.claim} [${e.tier}]`)} />
          <SectionBlock title="What we still need" items={section.whatWeStillNeed} />
          <SectionBlock title="In the panel" items={section.howToPresentInPanel} />
          <SectionBlock title="On the trail" items={section.howToPresentOnTrail} />
          <SectionBlock title="Hammer record" items={section.connectToHammerRecord} />
          <SectionBlock title="Pakko geometry" items={section.connectToPakko} />
          <SectionBlock title="Staff actions" items={section.staffActions} />
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
              const rel = getAccaConferenceDepthSection(id);
              return rel ? (
                <Link
                  key={id}
                  href={`/admin/intelligence/county-clerk-week/acca-summer-conference/${id}`}
                  className="text-kelly-navy underline"
                >
                  {rel.title.slice(0, 44)}…
                </Link>
              ) : null;
            })}
          </div>
        </>
      ) : (
        <ul className="mt-4 list-inside list-disc text-kelly-muted">
          {section.hardEvidence.slice(0, 2).map((e) => (
            <li key={e.claim.slice(0, 48)}>
              <span className={`mr-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${TIER_STYLE[e.tier]}`}>
                {e.tier}
              </span>
              {e.claim.slice(0, 100)}
              {e.claim.length > 100 ? "…" : ""}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function V4AccaConferenceEventBanner() {
  const event = loadAccaClerksConference2026();
  const panel = event.sosCandidatesPanel;

  return (
    <div className="mb-8 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/80 to-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-950">Next week · ACCA Summer Conference</p>
      <h2 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{event.title}</h2>
      <p className="mt-1 text-sm font-semibold text-violet-950">{event.theme}</p>
      <p className="mt-2 text-sm text-kelly-muted">
        {event.venue.name} · {event.venue.address} · June 10–12, 2026
      </p>
      <div className="mt-4 rounded-lg border border-kelly-navy/20 bg-kelly-navy/5 p-4">
        <p className="text-[10px] font-bold uppercase text-kelly-navy">Kelly panel — Thu June 11</p>
        <p className="mt-1 text-lg font-bold text-kelly-navy">
          {panel.startTime}–{panel.endTime} · {panel.durationMinutes} min · {panel.format}
        </p>
        <p className="mt-2 text-xs text-kelly-muted">
          {panel.candidates.map((c) => `${c.name} (${c.party})`).join(" · ")}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/intelligence/county-clerk-week/acca-summer-conference"
          className="rounded-lg bg-kelly-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-kelly-navy/90"
        >
          Full conference prep →
        </Link>
        <Link
          href="/admin/intelligence/election-funding/debate-funding"
          className="rounded-lg border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy"
        >
          CVSGF debate frame
        </Link>
        <Link
          href="/admin/intelligence/trap-lanes/county-champion"
          className="rounded-lg border border-amber-300/60 px-4 py-2 text-xs font-bold text-amber-950"
        >
          County champion traps
        </Link>
      </div>
      <p className="mt-3 text-[10px] text-kelly-muted">
        Coordinator: {event.coordinator.name} · {event.coordinator.mobile} · {event.coordinator.email}
      </p>
    </div>
  );
}

export function V4AccaConferenceDepthHub() {
  const event = loadAccaClerksConference2026();

  return (
    <section className="space-y-4">
      <V4AccaConferenceEventBanner />
      <header className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">Deep narrative drill-down</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">
          ACCA Mountain View — panel prep for clerks, not cable TV
        </h2>
        <p className="mt-2 text-sm text-kelly-muted">
          {ACCA_CONFERENCE_DEPTH_SECTIONS.length} sections: logistics, agenda context, two-hour three-way panel geometry,
          CVSGF funding for this room, ES&S/CTCL sponsor awareness, Hammer traps calibrated for clerks, and staff
          day-of checklist. Primary audience mode — partnership audition.
        </p>
        <p className="mt-2 text-xs text-kelly-muted">
          ACCA President: Margaret Darter (Faulkner County Clerk) · Presenter contact: Michael Roys{" "}
          {event.coordinator.mobile}
        </p>
      </header>
      {ACCA_CONFERENCE_DEPTH_SECTIONS.map((section) => (
        <DepthSectionCard key={section.sectionId} section={section} />
      ))}
    </section>
  );
}

export function V4AccaConferenceDepthSectionPanel({ sectionId }: { sectionId: string }) {
  const section = getAccaConferenceDepthSection(sectionId);
  if (!section) {
    return <p className="text-sm text-rose-900">Section not found.</p>;
  }
  return (
    <div className="space-y-4">
      <Link
        href="/admin/intelligence/county-clerk-week/acca-summer-conference"
        className="text-xs font-bold text-kelly-navy underline"
      >
        ← ACCA conference hub
      </Link>
      <DepthSectionCard section={section} expanded />
    </div>
  );
}
