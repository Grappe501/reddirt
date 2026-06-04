import Link from "next/link";
import { loadSupremeWorkbenchPacket } from "@/lib/intelligence/v4/supremeWorkbench";
import { KELLY_DILIGENCE_SEARCH_CHECKLIST, KELLY_DILIGENCE_COUNSEL_FRAME, diligenceCompletionPct } from "@/lib/intelligence/v4/kellyCourtDiligenceLog";
import { V4SupremeWorkbenchPanel } from "@/components/admin/intelligence/v4/V4SupremeWorkbenchPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function SupremeWorkbenchPage() {
  const packet = loadSupremeWorkbenchPacket();
  const clerkWeek = isCountyClerkPrimaryAudience();
  const diligencePct = diligenceCompletionPct();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={clerkWeek ? "Supreme workbench · county clerks week" : "Supreme workbench · debate intelligence v6"}
        title="Campaign debate prep & opposition strategy command"
        description="The unified operator surface: live readiness from every intelligence module, debate-day sequences, trap lanes, priority actions, and build gaps — one screen before stage."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-command"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Debate command
        </Link>
        <Link
          href="/admin/intelligence/build-progress"
          className="rounded-full border border-violet-800/30 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Build progress
        </Link>
      </V4PageHeader>

      <V4SupremeWorkbenchPanel packet={packet} variant="full" />

      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50/40 p-5 text-xs">
        <h2 className="text-sm font-bold uppercase text-amber-950">
          Kelly court/financial diligence log ({diligencePct}% searched)
        </h2>
        <p className="mt-2 text-kelly-muted">{KELLY_DILIGENCE_COUNSEL_FRAME}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-kelly-text/10 text-[10px] uppercase text-kelly-subtle">
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Search</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {KELLY_DILIGENCE_SEARCH_CHECKLIST.map((entry) => (
                <tr key={entry.id} className="border-b border-kelly-text/5">
                  <td className="py-2 pr-3 font-semibold text-kelly-navy">{entry.source}</td>
                  <td className="py-2 pr-3 text-kelly-muted">{entry.searchQuery}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        entry.result === "CLEAN"
                          ? "text-emerald-700"
                          : entry.result === "NOT_SEARCHED"
                            ? "text-rose-700"
                            : "text-amber-700"
                      }
                    >
                      {entry.result.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2 text-kelly-muted">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/admin/intelligence/kelly-debate-coaching" className="mt-4 inline-block font-bold text-kelly-navy underline">
          Kelly debate coaching — attack vector drills →
        </Link>
      </section>
    </div>
  );
}
