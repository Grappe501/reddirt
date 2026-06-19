import type { V4ThemeRow } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

export function ElectionPlanV4ThemeMatrix({ rows }: { rows: V4ThemeRow[] }) {
  const guide = getSurfaceGuide("themeMatrix");
  if (rows.length === 0) return <p className="text-sm text-[var(--ep-navy-muted)]">Theme matrix not loaded.</p>;
  return (
    <div className="space-y-4">
      {guide ? (
        <article className="ep-card border-indigo-200 bg-indigo-50/30 p-4 text-sm text-[var(--ep-navy-muted)]">
          <p className="text-xs font-bold uppercase text-indigo-900">How to use themes</p>
          <p className="mt-2">{guide.howToUseInDebate}</p>
        </article>
      ) : null}
      {rows.map((row) => (
        <article key={row.theme} className="ep-card p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-[var(--ep-navy)]">{row.label}</p>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900">
              {row.billCount} bills
            </span>
          </div>
          <p className="mt-2 font-mono text-xs text-[var(--ep-navy-muted)]">{row.bills.join(" · ")}</p>
          <p className="mt-2 text-xs text-amber-900">Verify act numbers on Arkleg before citing on stage.</p>
        </article>
      ))}
    </div>
  );
}
