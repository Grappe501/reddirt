import Link from "next/link";

import { ElectionPlanClaimsFinalCutPanel } from "@/components/election-plan/ElectionPlanClaimsFinalCutPanel";
import { ElectionPlanDay7BookendsPolishPanel } from "@/components/election-plan/ElectionPlanDay7BookendsPolishPanel";
import { ElectionPlanDay7DebriefImportPanel } from "@/components/election-plan/ElectionPlanDay7DebriefImportPanel";
import { ElectionPlanQuotableLockInPanel } from "@/components/election-plan/ElectionPlanQuotableLockInPanel";
import { DAY7_DAY8_TEASER } from "@/lib/election-plan/day7-learning-pathway";
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import { DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day7PolishBookendClient } from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { buildDay7PolishSurface } from "@/lib/election-plan/load-day7-polish-surface";

function toClientBookend(
  bookend: ReturnType<typeof buildDay7PolishSurface>["bookends"]["opening"],
): Day7PolishBookendClient {
  return {
    variant: bookend.variant,
    durationSeconds: bookend.durationSeconds,
    script: bookend.script,
    sourceLabel: bookend.sourceLabel,
    rehearsalHref: bookend.rehearsalHref,
  };
}

export function ElectionPlanDay7PathwayReturnLink({
  blockId,
  label = "Return to Day 7 pathway",
}: {
  blockId?: string;
  label?: string;
}) {
  const href = blockId ? epDebatePrepDayBlockHref(DAY7_ID, blockId) : epDebatePrepDayHref(DAY7_ID);
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:text-rose-950"
    >
      ← {label}
    </Link>
  );
}

export function ElectionPlanDay7BlockEmbed({ blockId }: { blockId: string }) {
  const polish = buildDay7PolishSurface();
  const opening = toClientBookend(polish.bookends.opening);
  const closing = toClientBookend(polish.bookends.closing);

  if (blockId === "b7-open-close") {
    return (
      <div className="mb-6 space-y-6">
        <ElectionPlanDay7PathwayReturnLink blockId="b7-open-close" />
        <ElectionPlanDay7DebriefImportPanel day6DebriefBlockHref={polish.day6DebriefBlockHref} />
        <ElectionPlanDay7BookendsPolishPanel opening={opening} closing={closing} variant="both" />
        <ElectionPlanQuotableLockInPanel candidates={polish.quotableCandidates} />
      </div>
    );
  }

  if (blockId === "b7-claims-final") {
    return (
      <div className="mb-6 space-y-6">
        <ElectionPlanDay7PathwayReturnLink blockId="b7-claims-final" />
        <ElectionPlanClaimsFinalCutPanel />
      </div>
    );
  }

  if (blockId === "b7-psych-three") {
    return (
      <div className="mb-6 space-y-4">
        <ElectionPlanDay7PathwayReturnLink blockId="b7-psych-three" />
        <article className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">ACCA three-way refresh</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">
            Eureka Springs matches ACCA panel geometry — slow down when Hammer performs for crowd. One pile-on pivot
            cold, then claims scan.
          </p>
          <Link href={epDebatePrepLaneHref("lane-d7-acca-psych")} className="mt-3 inline-block text-xs font-bold underline">
            ACCA psych lane →
          </Link>
          <Link
            href={epDebatePrepDayExampleHref(DAY7_ID, "ex7-show-steal")}
            className="mt-3 ml-4 inline-block text-xs font-bold underline"
          >
            Show-steal example →
          </Link>
        </article>
      </div>
    );
  }

  if (blockId === "b7-tutor-final") {
    return (
      <div className="mb-6 space-y-6">
        <ElectionPlanDay7PathwayReturnLink blockId="b7-tutor-final" />
        <ElectionPlanDay7DebriefImportPanel day6DebriefBlockHref={polish.day6DebriefBlockHref} />
        <p className="text-sm text-[var(--ep-navy-muted)]">
          Optional stretch — pick one weakness from Day 6 debrief, run one drill only. Bookends minimum stands if
          tired.
        </p>
        <Link
          href={DAY7_DAY8_TEASER.href}
          className="ep-card block border-rose-200 bg-rose-50/40 p-5 text-sm transition hover:border-rose-400"
        >
          <p className="text-xs font-bold uppercase text-rose-900">After polish</p>
          <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY7_DAY8_TEASER.title}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY7_DAY8_TEASER.body}</p>
        </Link>
      </div>
    );
  }

  return null;
}

export function ElectionPlanDay7RehearsalEmbed({ scriptId }: { scriptId: string }) {
  const polish = buildDay7PolishSurface();
  const opening = toClientBookend(polish.bookends.opening);
  const closing = toClientBookend(polish.bookends.closing);

  if (scriptId === "rehearse-bookends-three-reps") {
    return (
      <div className="mb-6 space-y-6">
        <ElectionPlanDay7PathwayReturnLink label="Return to Day 7 pathway" />
        <ElectionPlanDay7DebriefImportPanel day6DebriefBlockHref={polish.day6DebriefBlockHref} />
        <ElectionPlanDay7BookendsPolishPanel opening={opening} closing={closing} variant="both" />
      </div>
    );
  }

  if (scriptId === "rehearse-quotable-line") {
    return (
      <div className="mb-6">
        <ElectionPlanDay7PathwayReturnLink label="Return to Day 7 pathway" />
        <ElectionPlanQuotableLockInPanel candidates={polish.quotableCandidates} />
      </div>
    );
  }

  return null;
}

export function ElectionPlanDay7DrillEmbed({ drillId }: { drillId: string }) {
  if (drillId !== "d7-close") return null;

  const polish = buildDay7PolishSurface();
  const opening = toClientBookend(polish.bookends.opening);
  const closing = toClientBookend(polish.bookends.closing);

  return (
    <div className="mb-6">
      <ElectionPlanDay7PathwayReturnLink label="Return to Day 7 pathway" />
      <ElectionPlanDay7BookendsPolishPanel opening={opening} closing={closing} variant="closing" />
    </div>
  );
}

/** Micro-lesson — steal the show framing + quotable preview */
export function ElectionPlanDay7MicroLessonEmbed() {
  const polish = buildDay7PolishSurface();

  return (
    <div className="mb-6 space-y-4">
      <article className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-rose-900">Steal the show · quotable preview</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          Calm competence + one clerk-centered line — not volume. Staff picks from candidates on the bookends block after
          claims gate.
        </p>
      </article>
      <ElectionPlanQuotableLockInPanel candidates={polish.quotableCandidates} />
    </div>
  );
}
