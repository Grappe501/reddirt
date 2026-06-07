import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import type { Phase16SreCheckpointSurface } from "@/lib/intelligence/v4/phase16P9Closure";
import {
  getPhase16SreCheckpointOverlay,
  PHASE16_P9_STACK_BAR_PCT,
} from "@/lib/intelligence/v4/phase16P9SreClosureDepth";

export function Phase16SreClosureQueuePanel({
  checkpoints,
  sreExitReady,
}: {
  checkpoints: Phase16SreCheckpointSurface[];
  sreExitReady: boolean;
}) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-6 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold uppercase text-amber-950">SRE checkpoints</h2>
          <p className="mt-2 text-kelly-muted">
            Nine sub-passes P0–P8 aggregated — each must reach {PHASE16_P9_STACK_BAR_PCT}% for SRE exit.
            Staff coach P7, iPad player P5, and drill queue stage-safe P3 complete the stack gate.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
            sreExitReady
              ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border border-amber-300 bg-white text-amber-900"
          }`}
        >
          {sreExitReady ? "SRE exit ready" : "SRE in progress"}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-amber-200 text-[10px] uppercase text-amber-900">
              <th className="py-2 pr-3">Checkpoint</th>
              <th className="py-2 pr-3">Completion</th>
              <th className="py-2 pr-3">At bar</th>
              <th className="py-2 pr-3">P9 overlay</th>
              <th className="py-2">Links</th>
            </tr>
          </thead>
          <tbody>
            {checkpoints.map((cp) => {
              const overlay = getPhase16SreCheckpointOverlay(cp.checkpointId);
              return (
                <tr key={cp.checkpointId} className="border-b border-amber-100 align-top">
                  <td className="py-3 pr-3 font-bold text-kelly-navy">{cp.passLabel}</td>
                  <td className="py-3 pr-3 font-mono text-kelly-muted">{cp.completionPct}%</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        cp.atBar ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {cp.atBar ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        cp.phase16P9Enriched ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {cp.phase16P9Enriched ? "At bar" : "Gap"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <IntelligenceNavLink href={cp.upgradeHref} variant="chip" className="text-[10px]">
                        Upgrade
                      </IntelligenceNavLink>
                      <Link href={cp.hubHref} className="text-[10px] font-bold text-kelly-navy underline">
                        {overlay.hubHref.split("/").pop()}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
