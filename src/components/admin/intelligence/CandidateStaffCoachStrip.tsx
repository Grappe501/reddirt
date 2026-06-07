import Link from "next/link";
import type { StaffCoachSummary } from "@/lib/intelligence/v4/phase16P7StaffCoach";

export function CandidateStaffCoachStrip({ summary }: { summary: StaffCoachSummary }) {
  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 text-xs text-violet-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · Staff coach</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.pinCount}/{summary.maxPins} pinned
        </p>
      </div>
      {summary.hasAssignment && summary.assignedLaunchHref ? (
        <Link
          href={summary.assignedLaunchHref}
          className="mt-3 inline-block rounded-full border border-violet-500 bg-white px-3 py-1 text-[10px] font-bold text-violet-950"
        >
          Staff assigned: {summary.assignedEncounterTitle} →
        </Link>
      ) : null}
      {summary.pinnedDrills.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {summary.pinnedDrills.map((pin) => (
            <li key={pin.pinId}>
              <Link
                href={pin.href}
                className="inline-block rounded-full border border-violet-400 bg-white px-3 py-1 text-[10px] font-bold text-violet-950"
              >
                Must run: {pin.label} →
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Link
          href={summary.hubHref}
          className="mt-3 inline-block rounded-full border border-violet-300 bg-white px-3 py-1 text-[10px] font-bold text-violet-900"
        >
          Rehearsal coach (staff) →
        </Link>
      )}
    </section>
  );
}
