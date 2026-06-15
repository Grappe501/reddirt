import Link from "next/link";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { HOW_WE_WIN_CANDIDATE } from "@/lib/election-plan/how-we-win-candidate-content";
import { laneDescriptiveLabelByNumber } from "@/lib/election-plan/four-lanes-labels";
import { formatVotes } from "@/lib/election-plan/electionPlanData";

type Props = {
  data: ElectionPlanWorkbenchSnapshot;
  standalone?: boolean;
};

export function HowWeWinCandidatePanel({ data, standalone }: Props) {
  const c = HOW_WE_WIN_CANDIDATE;
  const expected = data.lanesOverview.expectedProjection;
  const range = data.electoralMath.pluralityRange;
  const recovery50 = data.electoralMath.dropOff.recovery50;
  const rawDropOff = data.electoralMath.dropOff.rawDropOff;

  function resolveVotes(row: (typeof c.winningPaths)[number]): string {
    if ("votes" in row && row.votes) return row.votes;
    if ("votesKey" in row && row.votesKey === "expectedProjection") return formatVotes(expected);
    if ("votesKey" in row && row.votesKey === "pluralityRange") {
      return `${formatVotes(range.low)}–${formatVotes(range.high)}`;
    }
    return "—";
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{c.title}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{c.subtitle}</p>
          <p className="mt-2 text-sm italic text-[var(--ep-navy-muted)]">{c.tagline}</p>
        </div>
        {standalone ? (
          <Link
            href="/election-plan?tab=howWeWin"
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← How We Win
          </Link>
        ) : null}
      </div>

      <div className="ep-card-glass mb-8">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">The opening</h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--ep-navy-muted)]">{c.opening.lead}</p>
        <p className="mt-3 text-base leading-relaxed text-[var(--ep-navy-muted)]">{c.opening.body}</p>
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">The three truths you own</h2>
      <ol className="mb-10 space-y-4">
        {c.threeTruths.map((t, i) => (
          <li key={t.headline} className="ep-card">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Truth {i + 1}</span>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
              <strong className="text-[var(--ep-navy)]">{t.headline}</strong> {t.body}
            </p>
          </li>
        ))}
      </ol>

      <h2 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">What winning looks like</h2>
      <div className="mb-10 overflow-x-auto ep-card">
        <table className="w-full min-w-[20rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="pb-2 pr-4">Path</th>
              <th className="pb-2 text-right">Votes</th>
            </tr>
          </thead>
          <tbody>
            {c.winningPaths.map((row) => (
              <tr key={row.label} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2.5 pr-4 font-medium">{row.label}</td>
                <td className="py-2.5 text-right font-heading text-lg font-bold tabular-nums">
                  {resolveVotes(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">Your four lanes (say them every time)</h2>
      <ol className="mb-6 space-y-3">
        {c.fourLanesScript.map((lane, i) => (
          <li key={lane.action} className="flex flex-wrap items-baseline gap-2 text-sm">
            <span className="font-heading text-lg font-bold text-[var(--ep-navy)]">{i + 1}.</span>
            <span className="font-semibold text-[var(--ep-navy)]">{lane.action}</span>
            <span className="text-[var(--ep-navy-muted)]">
              {"detailKey" in lane && lane.detailKey === "recovery50"
                ? `drop-off voters (${formatVotes(recovery50)} @ half recovery · ${formatVotes(rawDropOff)} pool)`
                : "detail" in lane
                  ? lane.detail
                  : ""}
            </span>
          </li>
        ))}
      </ol>

      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="rounded-md border border-[var(--ep-border)] bg-[var(--ep-cream)]/50 px-3 py-2 text-xs text-[var(--ep-navy-muted)]">
            {laneDescriptiveLabelByNumber(n as 1 | 2 | 3 | 4)}
          </div>
        ))}
      </div>

      <div className="ep-card mb-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-gold)]">Voice</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          <Link href="/election-plan/big-table-doctrine" className="font-semibold text-[var(--ep-navy)] underline">
            Big Table Democrat Doctrine
          </Link>
          {" — "}
          {c.voiceNote}
        </p>
      </div>

      <div className="ep-card-glass mb-10">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Close</h2>
        <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ep-navy)]">{c.close}</p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/election-plan/executive-book/message" className="ep-chapter-link">
          Kelly Grappe message chapter →
        </Link>
        <Link href="/election-plan/big-table-doctrine" className="ep-chapter-link">
          Big Table doctrine →
        </Link>
        <Link href="/election-plan/lanes-overview" className="ep-chapter-link">
          Four lanes breakdown →
        </Link>
      </div>
    </section>
  );
}
