import Link from "next/link";

import { ElectionPlanBiosLockInChecklist } from "@/components/election-plan/ElectionPlanBiosLockInChecklist";
import { ElectionPlanDebateBookendsPanel } from "@/components/election-plan/ElectionPlanDebateBookendsPanel";
import { ElectionPlanFullSimulationRunner } from "@/components/election-plan/ElectionPlanFullSimulationRunner";
import { ElectionPlanReadinessAuditPanel } from "@/components/election-plan/ElectionPlanReadinessAuditPanel";
import { ElectionPlanSimDebriefLog } from "@/components/election-plan/ElectionPlanSimDebriefLog";
import { ElectionPlanWhenXSayYSheet } from "@/components/election-plan/ElectionPlanWhenXSayYSheet";
import { DAY6_DAY7_TEASER } from "@/lib/election-plan/day6-learning-pathway";
import {
  EP_TRAP_LANES_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY6_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { buildDay5CapitalizeSurface } from "@/lib/election-plan/load-day5-capitalize-surface";
import { buildDay6SimulationSurface } from "@/lib/election-plan/load-day6-simulation-surface";
import { getOpponentBio } from "@/lib/election-plan/opponentBioDrillDown";

export function ElectionPlanDay6PathwayReturnLink({
  blockId,
  label = "Return to Day 6 pathway",
}: {
  blockId?: string;
  label?: string;
}) {
  const href = blockId ? epDebatePrepDayBlockHref(DAY6_ID, blockId) : epDebatePrepDayHref(DAY6_ID);
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-violet-800 hover:text-violet-950"
    >
      ← {label}
    </Link>
  );
}

function buildBiosOpponents() {
  const hammer = getOpponentBio("kim-hammer")!;
  const pakko = getOpponentBio("michael-packo")!;
  return [
    {
      opponentId: "kim-hammer",
      displayName: hammer.displayName,
      lines: hammer.memoryLines.map((l) => ({ label: l.label, text: l.text })),
    },
    {
      opponentId: "michael-packo",
      displayName: pakko.displayName,
      lines: pakko.memoryLines.map((l) => ({ label: l.label, text: l.text })),
    },
  ];
}

export function ElectionPlanDay6BlockEmbed({ blockId }: { blockId: string }) {
  const sim = buildDay6SimulationSurface();
  const day5 = buildDay5CapitalizeSurface();
  const segmentLabels = sim.segments.map((s) => s.label);

  if (blockId === "b6-opponent-bios-lock") {
    return (
      <div className="mb-6">
        <ElectionPlanDay6PathwayReturnLink blockId="b6-opponent-bios-lock" />
        <ElectionPlanBiosLockInChecklist opponents={buildBiosOpponents()} />
      </div>
    );
  }

  if (blockId === "b6-sim") {
    return (
      <div className="mb-6 space-y-6">
        <ElectionPlanDay6PathwayReturnLink blockId="b6-sim" />
        <ElectionPlanDebateBookendsPanel opening={sim.bookends.opening} closing={sim.bookends.closing} variant="both" />
        <ElectionPlanFullSimulationRunner
          segments={sim.segments}
          pairs={day5.pairs}
          hasDay5Minimum={sim.hasDay5Minimum}
        />
        <ElectionPlanSimDebriefLog segmentLabels={segmentLabels} />
        <Link
          href={DAY6_DAY7_TEASER.href}
          className="ep-card block border-violet-200 bg-violet-50/40 p-5 text-sm transition hover:border-violet-400"
        >
          <p className="text-xs font-bold uppercase text-violet-900">After sim</p>
          <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY6_DAY7_TEASER.title}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY6_DAY7_TEASER.body}</p>
        </Link>
      </div>
    );
  }

  if (blockId === "b6-prep") {
    return (
      <div className="mb-6 space-y-6">
        <ElectionPlanDay6PathwayReturnLink blockId="b6-prep" />
        <ElectionPlanWhenXSayYSheet
          pairs={day5.pairs}
          hasDay4Minimum={day5.hasDay4Minimum}
          day4NotecardCount={day5.day4NotecardCount}
          compact
        />
        <p className="text-xs text-[var(--ep-navy-muted)]">
          Pocket review only —{" "}
          <Link href={EP_TRAP_LANES_HREF} className="font-bold text-[var(--ep-navy)] underline">
            trap lanes
          </Link>{" "}
          and{" "}
          <Link href={EP_DEBATE_QUESTIONS_HREF} className="font-bold text-[var(--ep-navy)] underline">
            SOS questions
          </Link>{" "}
          at moderator pace. No new research tonight.
        </p>
      </div>
    );
  }

  if (blockId === "b6-command") {
    return (
      <div className="mb-6">
        <ElectionPlanDay6PathwayReturnLink blockId="b6-command" />
        <ElectionPlanReadinessAuditPanel />
      </div>
    );
  }

  if (blockId === "b6-depth") {
    return (
      <div className="mb-6">
        <ElectionPlanDay6PathwayReturnLink blockId="b6-depth" />
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          Three bridges memorized — use d6-stuck-bridge command drill on the pathway tail.
        </p>
      </div>
    );
  }

  return null;
}

export function ElectionPlanDay6RehearsalEmbed() {
  const sim = buildDay6SimulationSurface();

  return (
    <div className="mb-6">
      <ElectionPlanDay6PathwayReturnLink label="Return to Day 6 pathway" />
      <ElectionPlanDebateBookendsPanel opening={sim.bookends.opening} closing={sim.bookends.closing} variant="both" />
    </div>
  );
}
