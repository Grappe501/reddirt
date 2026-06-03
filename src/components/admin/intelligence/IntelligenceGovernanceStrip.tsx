import { INTELLIGENCE_LAUNCH_BANNER } from "@/lib/intelligence/intelligenceLaunchMode";

/** Shown at top of every intelligence page — candidate-safe governance language. */
export function IntelligenceGovernanceStrip() {
  return (
    <div
      role="status"
      className="mb-5 rounded-lg border-2 border-amber-600/35 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900">Internal use only</p>
      <p className="mt-1 font-semibold leading-snug">{INTELLIGENCE_LAUNCH_BANNER}</p>
      <p className="mt-2 text-xs text-amber-900/90">
        Nothing here publishes to the website automatically. Scores measure evidence depth in our research files — not
        your debate performance. When in doubt, use Claims ledger and staff review before repeating a line publicly.
      </p>
    </div>
  );
}
