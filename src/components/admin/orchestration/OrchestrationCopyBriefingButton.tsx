"use client";

import type { OrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";

export function OrchestrationCopyBriefingButton({ payload }: { payload: OrchestrationStatePayload }) {
  const text = [
    `Campaign Orchestration Briefing — ${payload.meta.period}`,
    payload.diagnosis.executiveSummary,
    "",
    "Top moves:",
    ...payload.topMoves.map((m, i) => `${i + 1}. ${m.title} — ${m.whyThisMatters}`),
    "",
    "Blockers:",
    ...payload.blockers.slice(0, 5).map((b) => `- [${b.severity}] ${b.message}`),
  ].join("\n");

  return (
    <button
      type="button"
      className="rounded-lg border border-kelly-navy/20 bg-white px-3 py-1.5 text-xs font-bold text-kelly-navy hover:bg-kelly-page"
      onClick={() => {
        void navigator.clipboard.writeText(text);
      }}
    >
      Copy briefing
    </button>
  );
}
