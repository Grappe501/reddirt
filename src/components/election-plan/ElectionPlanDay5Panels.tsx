import Link from "next/link";

import { ElectionPlanMootCourtHandoff } from "@/components/election-plan/ElectionPlanMootCourtHandoff";
import { ElectionPlanPileOnPivotPanel } from "@/components/election-plan/ElectionPlanPileOnPivotPanel";
import { ElectionPlanSosSprintTimer } from "@/components/election-plan/ElectionPlanSosSprintTimer";
import { ElectionPlanTrapLaneSprintPanel } from "@/components/election-plan/ElectionPlanTrapLaneSprintPanel";
import { ElectionPlanWhenXSayYSheet } from "@/components/election-plan/ElectionPlanWhenXSayYSheet";
import { DAY5_DAY6_TEASER } from "@/lib/election-plan/day5-learning-pathway";
import { buildDay5CapitalizeSurface } from "@/lib/election-plan/load-day5-capitalize-surface";
import { epDebatePrepDayBlockHref, epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanDay5PathwayReturnLink({
  blockId,
  label = "Return to Day 5 pathway",
}: {
  blockId?: string;
  label?: string;
}) {
  const href = blockId ? epDebatePrepDayBlockHref(DAY5_ID, blockId) : epDebatePrepDayHref(DAY5_ID);
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
    >
      ← {label}
    </Link>
  );
}

export function ElectionPlanDay6TeaserCard() {
  return (
    <Link
      href={DAY5_DAY6_TEASER.href}
      className="ep-card mt-6 block border-emerald-200 bg-emerald-50/40 p-5 text-sm transition hover:border-emerald-400"
    >
      <p className="text-xs font-bold uppercase text-emerald-900">You are ready for Day 6</p>
      <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY5_DAY6_TEASER.title}</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY5_DAY6_TEASER.body}</p>
      <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Day 6 →</p>
    </Link>
  );
}

export function ElectionPlanDay5BlockEmbed({ blockId }: { blockId: string }) {
  const surface = buildDay5CapitalizeSurface();

  if (blockId === "b5-lab-review") {
    return (
      <div className="mb-6 space-y-0">
        <ElectionPlanDay5PathwayReturnLink blockId="b5-lab-review" />
        <ElectionPlanWhenXSayYSheet
          pairs={surface.pairs}
          hasDay4Minimum={surface.hasDay4Minimum}
          day4NotecardCount={surface.day4NotecardCount}
        />
        <ElectionPlanDay6TeaserCard />
      </div>
    );
  }

  if (blockId === "b5-trap-all") {
    return (
      <div className="mb-6">
        <ElectionPlanDay5PathwayReturnLink blockId="b5-trap-all" />
        <ElectionPlanTrapLaneSprintPanel lanes={surface.trapLanes} />
        <ElectionPlanPileOnPivotPanel />
        <ElectionPlanDay6TeaserCard />
      </div>
    );
  }

  if (blockId === "b5-sos-sprint") {
    return (
      <div className="mb-6">
        <ElectionPlanDay5PathwayReturnLink blockId="b5-sos-sprint" />
        <ElectionPlanSosSprintTimer questions={surface.sosQuestions} />
        <ElectionPlanDay6TeaserCard />
      </div>
    );
  }

  if (blockId === "b5-tutor") {
    return (
      <div className="mb-6">
        <ElectionPlanDay5PathwayReturnLink blockId="b5-tutor" />
        <ElectionPlanMootCourtHandoff verifiedHammerLineCount={surface.verifiedHammerLineCount} />
        <ElectionPlanDay6TeaserCard />
      </div>
    );
  }

  return null;
}

/** Forum lab — Day 5 capitalize export handoff */
export function ElectionPlanDay5ForumCapitalizeExport() {
  const surface = buildDay5CapitalizeSurface();

  return (
    <section className="mb-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-900">Day 5 · capitalize export</p>
      <ElectionPlanDay5PathwayReturnLink blockId="b5-lab-review" label="Return to Day 5 capitalize block" />
      <ElectionPlanWhenXSayYSheet
        pairs={surface.pairs}
        hasDay4Minimum={surface.hasDay4Minimum}
        day4NotecardCount={surface.day4NotecardCount}
        compact
      />
    </section>
  );
}

/** Rehearsal page — timed pairs from sheet */
export function ElectionPlanDay5RehearsalEmbed() {
  const surface = buildDay5CapitalizeSurface();

  return (
    <div className="mb-6">
      <ElectionPlanDay5PathwayReturnLink label="Return to Day 5 pathway" />
      <ElectionPlanWhenXSayYSheet
        pairs={surface.pairs}
        hasDay4Minimum={surface.hasDay4Minimum}
        day4NotecardCount={surface.day4NotecardCount}
        compact
      />
    </div>
  );
}

/** Micro-lesson — capitalize vs counter primer */
export function ElectionPlanDay5MicroLessonEmbed() {
  return (
    <article className="ep-card mb-6 border-emerald-200 bg-emerald-50/30 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-emerald-900">Capitalize vs counter</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Countering keeps you in Hammer&apos;s frame. Capitalizing names what clerks need next — one sentence bridge from
        their line to your lane. Open the when-X-say-Y sheet on the capitalize block to time eight pairs.
      </p>
      <Link
        href={epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review")}
        className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-4 inline-block"
      >
        Open capitalize sheet block →
      </Link>
    </article>
  );
}
