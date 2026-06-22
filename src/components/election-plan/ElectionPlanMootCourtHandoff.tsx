import Link from "next/link";

import {
  DEBATE_PREP_TUTOR_PRESET_FORUM_HAMMER,
  epDebatePrepDayBlockHref,
  epDebatePrepTutorPresetHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanMootCourtHandoff({
  verifiedHammerLineCount,
}: {
  verifiedHammerLineCount: number;
}) {
  const tutorHref = epDebatePrepTutorPresetHref(DEBATE_PREP_TUTOR_PRESET_FORUM_HAMMER);

  return (
    <section className="ep-card border-2 border-fuchsia-300/60 bg-fuchsia-50/30 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-fuchsia-900">Moot court handoff · ~30 min optional</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Open the AI tutor in <strong className="text-[var(--ep-navy)]">moot court</strong> mode with forum-derived Hammer
        lines only — no admin detour. Staff plays moderator; Kelly uses capitalize sheet pairs.
      </p>
      {verifiedHammerLineCount > 0 ? (
        <p className="mt-2 text-xs text-emerald-900">
          {verifiedHammerLineCount} verified Hammer forum line(s) available for moot prompts.
        </p>
      ) : (
        <p className="mt-2 text-xs text-amber-950">
          Run Day 4 v2 deep analysis first if you want verified Hammer lines in moot prompts.
        </p>
      )}
      <Link href={tutorHref} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-4 inline-block">
        Start forum Hammer moot court →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Preset opens election-plan tutor with moot-court mode highlighted — stay on Kelly-facing surfaces.
      </p>
      <Link
        href={epDebatePrepDayBlockHref(DAY5_ID, "b5-tutor")}
        className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline"
      >
        ← Return to tutor block study
      </Link>
    </section>
  );
}
