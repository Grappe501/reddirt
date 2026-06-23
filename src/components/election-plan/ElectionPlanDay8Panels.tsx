import Link from "next/link";

import { ElectionPlanDay8BlockPathwayStrip } from "@/components/election-plan/ElectionPlanDay8BlockPathwayStrip";
import { ElectionPlanDay8ClosingWorkshopPanel } from "@/components/election-plan/ElectionPlanDay8ClosingWorkshopPanel";
import { ElectionPlanDay8CrashRunPanel } from "@/components/election-plan/ElectionPlanDay8CrashRunPanel";
import { ElectionPlanDay8LockSheetPanel } from "@/components/election-plan/ElectionPlanDay8LockSheetPanel";
import { ElectionPlanDay8MiddleGamePanel } from "@/components/election-plan/ElectionPlanDay8MiddleGamePanel";
import { ElectionPlanDay8OpeningWorkshopPanel } from "@/components/election-plan/ElectionPlanDay8OpeningWorkshopPanel";
import { ElectionPlanDay8PersonaWallPanel } from "@/components/election-plan/ElectionPlanDay8PersonaWallPanel";
import {
  DAY8_AUDIBLE_CARD,
  DAY8_CLAIMS_GATE,
  DAY8_SOS_THREE_DOMAINS_FRAME,
} from "@/lib/election-plan/debate-prep-day8-crash-copy";
import { epDebatePrepDayBlockHref, epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { buildDay8CrashCourseSurface } from "@/lib/election-plan/load-day8-crash-course-surface";

export function ElectionPlanDay8PathwayReturnLink({
  blockId,
  label = "Return to Day 8 crash course",
}: {
  blockId?: string;
  label?: string;
}) {
  const href = blockId ? epDebatePrepDayBlockHref(DAY8_ID, blockId) : epDebatePrepDayHref(DAY8_ID);
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
    >
      ← {label}
    </Link>
  );
}

function Day8OrientEmbed() {
  return (
    <div className="mb-6 space-y-3 rounded-lg border border-emerald-300/50 bg-emerald-50/40 p-4 text-sm">
      <p className="text-xs font-bold uppercase text-emerald-900">{DAY8_AUDIBLE_CARD}</p>
      <p className="text-xs text-emerald-950">{DAY8_SOS_THREE_DOMAINS_FRAME}</p>
      <p className="text-xs text-amber-950">{DAY8_CLAIMS_GATE[0]}</p>
    </div>
  );
}

function Day8CommandEmbed() {
  const surface = buildDay8CrashCourseSurface();
  return (
    <div className="mb-6 rounded-lg border border-emerald-300/50 bg-emerald-50/40 p-4 text-sm">
      <p className="text-xs font-bold uppercase text-emerald-900">Command mode · body before words</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Breath + scan + listen face — then persona wall assigns who you picture for each SOS domain.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--ep-navy-muted)]">
        {surface.claimsGateLines.map((line) => (
          <li key={line.slice(0, 40)}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/** Pass 4 — interactive panel router for Day 8 section blocks */
export function ElectionPlanDay8BlockEmbed({ blockId }: { blockId: string }) {
  const surface = buildDay8CrashCourseSurface();

  return (
    <>
      <ElectionPlanDay8BlockPathwayStrip sectionId={blockId} />

      {blockId === "s8-orient" || blockId === "s8-pre-debate" ? <Day8OrientEmbed /> : null}

      {blockId === "s8-command" ? (
        <div className="mb-6 space-y-4">
          <ElectionPlanDay8PathwayReturnLink blockId="s8-command" />
          <Day8CommandEmbed />
        </div>
      ) : null}

      {blockId === "s8-persona-wall" ? (
        <div className="mb-6">
          <ElectionPlanDay8PathwayReturnLink blockId="s8-persona-wall" />
          <ElectionPlanDay8PersonaWallPanel domains={surface.domains} />
        </div>
      ) : null}

      {blockId === "s8-opening-workshop" ? (
        <div className="mb-6">
          <ElectionPlanDay8PathwayReturnLink blockId="s8-opening-workshop" />
          <ElectionPlanDay8OpeningWorkshopPanel
            openingBeats={surface.openingBeats}
            openingScript={surface.bookends.opening.script}
            rehearsalHref={surface.bookends.opening.rehearsalHref}
          />
        </div>
      ) : null}

      {blockId === "s8-middle-game" ? (
        <div className="mb-6">
          <ElectionPlanDay8PathwayReturnLink blockId="s8-middle-game" />
          <ElectionPlanDay8MiddleGamePanel domains={surface.domains} trapPairs={surface.whenXSayYPairs} />
        </div>
      ) : null}

      {blockId === "s8-closing-workshop" ? (
        <div className="mb-6">
          <ElectionPlanDay8PathwayReturnLink blockId="s8-closing-workshop" />
          <ElectionPlanDay8ClosingWorkshopPanel
            closingScript={surface.bookends.closing.script}
            rehearsalHref={surface.bookends.closing.rehearsalHref}
          />
        </div>
      ) : null}

      {blockId === "s8-run-through" ? (
        <div className="mb-6">
          <ElectionPlanDay8PathwayReturnLink blockId="s8-run-through" />
          <ElectionPlanDay8CrashRunPanel segments={surface.runSegments} />
        </div>
      ) : null}

      {blockId === "s8-lock-sheet" ? (
        <div className="mb-6">
          <ElectionPlanDay8PathwayReturnLink blockId="s8-lock-sheet" />
          <ElectionPlanDay8LockSheetPanel rows={surface.lockSheetDomainRows} />
        </div>
      ) : null}
    </>
  );
}
