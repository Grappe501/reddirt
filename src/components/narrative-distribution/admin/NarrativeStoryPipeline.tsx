import type { StoryIntake } from "@/lib/narrative-distribution/types";

type Props = { items: StoryIntake[] };

function geographyLabel(g: StoryIntake["geography"]): string {
  if (!g) return "Statewide (unspecified)";
  if (g.scope === "state") return `State — ${g.stateCode ?? "AR"}`;
  if (g.scope === "region") return `Region — ${g.regionKey ?? "—"}`;
  if (g.scope === "county") return `County — ${g.countySlug ?? "—"}`;
  return g.scope;
}

function formatRecorded(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function NarrativeStoryPipeline({ items }: Props) {
  const ordered = [...items].sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1));

  return (
    <ul className="space-y-3">
      {ordered.map((s) => (
        <li
          key={s.id}
          className="rounded-card border border-kelly-text/10 bg-kelly-page/90 p-4 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/45">Story intake</p>
            <p className="font-mono text-[10px] text-kelly-text/45">{formatRecorded(s.recordedAt)}</p>
          </div>
          <p className="mt-2 text-sm font-medium text-kelly-text">{s.themeSummary}</p>
          <p className="mt-2 text-xs text-kelly-text/60">{geographyLabel(s.geography)}</p>
          {s.suggestedCategories?.length ? (
            <p className="mt-2 text-xs text-kelly-text/55">
              Categories: {s.suggestedCategories.join(", ")}
            </p>
          ) : null}
          {s.isDemoPlaceholder ? (
            <p className="mt-2 inline-block rounded-full bg-amber-100/80 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-950">
              Demo placeholder
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
