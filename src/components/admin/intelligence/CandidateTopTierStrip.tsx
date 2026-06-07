import Link from "next/link";
import type { TopTierPrepItem } from "@/lib/intelligence/v4/phase15P4TopTierSurfacing";

const KIND_STYLE: Record<TopTierPrepItem["kind"], string> = {
  briefing: "border-violet-200 bg-violet-50 text-violet-950",
  depth: "border-indigo-200 bg-indigo-50 text-indigo-950",
  psychology: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950",
};

const KIND_LABEL: Record<TopTierPrepItem["kind"], string> = {
  briefing: "Briefing",
  depth: "Depth",
  psychology: "Psychology",
};

export function CandidateTopTierStrip({
  items,
  hubHref,
  minutesTotal,
  compact,
}: {
  items: TopTierPrepItem[];
  hubHref: string;
  minutesTotal: number;
  compact?: boolean;
}) {
  if (!items.length) return null;

  return (
    <section
      className={`rounded-xl border-2 border-violet-300/70 bg-gradient-to-br from-violet-50/50 to-white ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-950">Phase 15 · Top-tier prep</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">Promoted tonight</h3>
          {!compact ? (
            <p className="mt-1 text-sm text-kelly-muted">
              Briefings, depth, and psychology — surfaced here instead of buried in builder nav.
            </p>
          ) : null}
        </div>
        <p className="text-right text-xs font-bold text-violet-950">
          {items.length} reads · ~{minutesTotal} min
        </p>
      </div>

      <ol className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-kelly-text/10 bg-white p-3 text-sm transition hover:border-violet-300"
            >
              <div>
                <span
                  className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${KIND_STYLE[item.kind]}`}
                >
                  {KIND_LABEL[item.kind]}
                </span>
                <span className="font-semibold text-kelly-navy">{item.title}</span>
                <p className="mt-1 text-[10px] italic text-kelly-muted">&ldquo;{item.rehearseOutLoud.slice(0, 120)}…&rdquo;</p>
              </div>
              <span className="text-[10px] font-mono text-kelly-subtle">{item.estimatedMinutes}m</span>
            </Link>
          </li>
        ))}
      </ol>

      <Link
        href={hubHref}
        className="mt-4 inline-block rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
      >
        Full top-tier inventory →
      </Link>
    </section>
  );
}
