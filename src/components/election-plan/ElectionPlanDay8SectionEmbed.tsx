import { buildDay8CrashCourseSurface } from "@/lib/election-plan/load-day8-crash-course-surface";

export function ElectionPlanDay8SectionEmbed({ sectionId }: { sectionId: string }) {
  const surface = buildDay8CrashCourseSurface();

  if (sectionId === "s8-orient" || sectionId === "s8-opening-workshop") {
    return (
      <div className="mb-6 rounded-lg border border-emerald-300/50 bg-emerald-50/40 p-4 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Three SOS domains · opening spine</p>
        <ul className="mt-3 space-y-2 text-[var(--ep-navy-muted)]">
          {surface.domains.map((d) => (
            <li key={d.id}>
              <strong className="text-[var(--ep-navy)]">{d.shortLabel}:</strong> {d.kellyProofTemplate.slice(0, 140)}…
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (sectionId === "s8-middle-game") {
    return (
      <div className="mb-6 space-y-3">
        {surface.domains.map((d) => (
          <article key={d.id} className="rounded-lg border border-[var(--ep-border)] bg-white/80 p-4 text-sm">
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">SOS · {d.shortLabel} · 90s</p>
            <p className="mt-2 font-semibold text-[var(--ep-navy)]">{d.moderatorTheme}</p>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{d.answerSpine}</p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Picture {d.personaSpeakTo}</p>
          </article>
        ))}
      </div>
    );
  }

  if (sectionId === "s8-run-through") {
    return (
      <div className="mb-6 rounded-lg border border-violet-300/50 bg-violet-50/40 p-4 text-sm">
        <p className="text-xs font-bold uppercase text-violet-900">Run-through · {surface.runSegmentCount} segments</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-[var(--ep-navy-muted)]">
          {surface.runSegments.map((s) => (
            <li key={s.segmentIndex}>
              {s.label}
              {s.sosDomainId ? ` · ${s.sosDomainId}` : ""}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (sectionId === "s8-lock-sheet") {
    return (
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-sm">
        <p className="text-xs font-bold uppercase text-amber-950">Lock sheet · domain rows</p>
        <ul className="mt-3 space-y-2 text-[var(--ep-navy-muted)]">
          {surface.lockSheetDomainRows.map((row) => (
            <li key={row.domainId}>
              <strong className="text-[var(--ep-navy)]">{row.domainLabel}:</strong> {row.lockedLine}…
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}
