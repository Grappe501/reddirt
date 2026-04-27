import Link from "next/link";
import type { CountyNarrativePlan } from "@/lib/narrative-distribution/types";
import { getDemoNarrativePacketById } from "@/lib/narrative-distribution/assets";

type Props = { items: CountyNarrativePlan[] };

const GAP_LABELS: Record<string, string> = {
  missing_local_proof: "Local proof",
  missing_language: "Language",
  missing_distribution: "Distribution",
  pending_review: "Review",
  other: "Other",
};

export function NarrativeCountyPacketList({ items }: Props) {
  return (
    <div className="overflow-x-auto rounded-card border border-kelly-text/10 bg-kelly-page/90 shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-kelly-text/10 bg-kelly-text/[0.03] text-[10px] font-bold uppercase tracking-widest text-kelly-text/50">
            <th className="px-4 py-3">County</th>
            <th className="px-4 py-3">Active packet</th>
            <th className="px-4 py-3">Headline</th>
            <th className="px-4 py-3">Gaps</th>
            <th className="px-4 py-3">OIS stub</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const packet = c.activeNarrativePacketId ? getDemoNarrativePacketById(c.activeNarrativePacketId) : undefined;
            return (
              <tr key={c.id} className="border-b border-kelly-text/5 last:border-0">
                <td className="px-4 py-3 font-semibold text-kelly-text">{c.countyDisplayName}</td>
                <td className="px-4 py-3 text-kelly-text/80">{packet?.title ?? c.activeNarrativePacketId ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-kelly-text/70">{c.headline ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.gaps.map((g) => (
                      <span
                        key={g}
                        className="rounded-full border border-kelly-text/15 bg-kelly-text/[0.04] px-2 py-0.5 text-[10px] font-semibold text-kelly-text/70"
                      >
                        {GAP_LABELS[g] ?? g}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/organizing-intelligence/counties/${c.countySlug}`}
                    className="text-xs font-semibold text-kelly-navy underline"
                  >
                    Open stub
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
