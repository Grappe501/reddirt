import { INTELLIGENCE_LAUNCH_BANNER } from "@/lib/intelligence/intelligenceLaunchMode";

export function IntelligenceEmergencyLaunchBanner() {
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border-2 border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900">Internal launch mode</p>
      <p className="mt-1 font-semibold">{INTELLIGENCE_LAUNCH_BANNER}</p>
      <p className="mt-1 text-xs text-amber-900/90">
        NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED · Scores reflect evidence depth, not candidate performance.
      </p>
    </div>
  );
}
