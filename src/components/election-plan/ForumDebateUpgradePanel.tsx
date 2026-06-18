import Link from "next/link";

import { EP_FORUM_TRANSCRIPT_LAB_HREF } from "@/lib/election-plan/debate-prep-links";
import { isForumDebateUpgradeReady, loadForumDebateUpgrade } from "@/lib/intelligence/v4/forumDebateUpgrade";

export function ForumDebateUpgradePanel() {
  const upgrade = loadForumDebateUpgrade();
  if (!isForumDebateUpgradeReady()) return null;

  return (
    <article className="ep-card border-2 border-[var(--ep-gold)]/50 bg-[var(--ep-cream)]/60 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">ACCA forum upgrade · v1</p>
      <h2 className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">Transcript-molded debate intel</h2>
      {upgrade.executiveBrief ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{upgrade.executiveBrief}</p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2 text-sm">
        {upgrade.hammerThemes.length ? (
          <div>
            <p className="font-bold text-rose-900">Hammer themes (forum)</p>
            <ul className="mt-2 list-inside list-disc text-[var(--ep-navy-muted)]">
              {upgrade.hammerThemes.slice(0, 6).map((t) => (
                <li key={t.slice(0, 48)}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {upgrade.pakkoThemes.length ? (
          <div>
            <p className="font-bold text-amber-900">Pakko themes (forum)</p>
            <ul className="mt-2 list-inside list-disc text-[var(--ep-navy-muted)]">
              {upgrade.pakkoThemes.slice(0, 6).map((t) => (
                <li key={t.slice(0, 48)}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {upgrade.capitalizeMoves.length ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Capitalize moves (sample)</p>
          {upgrade.capitalizeMoves.slice(0, 4).map((m, i) => (
            <div key={`${m.trigger.slice(0, 20)}-${i}`} className="rounded-lg border border-[var(--ep-border)] bg-white p-3 text-sm">
              <p className="font-bold text-rose-950">If: {m.trigger}</p>
              <p className="mt-1 font-bold text-[var(--ep-navy)]">Kelly: {m.kellyLine}</p>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        Built from {upgrade.transcriptChars.toLocaleString()} transcript chars ·{" "}
        <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="font-semibold underline">
          Forum lab
        </Link>
        {" · "}
        Day 5 command drills auto-merge forum capitalize moves.
      </p>
    </article>
  );
}
