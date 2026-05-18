"use client";

import { useTransition } from "react";
import {
  exportRuleCoverageReportAction,
  flagRuleSourceStaleAction,
  markRuleSourceReviewedAction,
  rebuildComplianceRuleCorpusAction,
  verifyComplianceRuleLinksAction,
} from "../actions";

export function RuleDashboardActions({ sourceIds }: { sourceIds: string[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={pending} className="rounded-full bg-kelly-text px-4 py-2 text-sm font-semibold text-white" onClick={() => start(() => rebuildComplianceRuleCorpusAction())}>
        Rebuild corpus
      </button>
      <button type="button" disabled={pending} className="rounded-full border border-kelly-text/20 px-4 py-2 text-sm font-semibold" onClick={() => start(() => verifyComplianceRuleLinksAction())}>
        Verify links
      </button>
      <button
        type="button"
        disabled={pending}
        className="rounded-full border border-kelly-text/20 px-4 py-2 text-sm font-semibold"
        onClick={() => start(async () => {
          const path = await exportRuleCoverageReportAction();
          window.alert(`Coverage report written: ${path}`);
        })}
      >
        Export coverage report
      </button>
      {sourceIds.slice(0, 3).map((sourceId) => (
        <button
          key={sourceId}
          type="button"
          disabled={pending}
          className="rounded-full border border-amber-700/30 px-4 py-2 text-sm font-semibold text-amber-900"
          onClick={() => {
            const initials = window.prompt("Compliance officer initials (required for human review mark):");
            if (!initials?.trim()) return;
            const note = window.prompt("Review note (optional):") ?? undefined;
            start(() => markRuleSourceReviewedAction({ sourceId, initials, note }));
          }}
        >
          Mark reviewed: {sourceId}
        </button>
      ))}
      {sourceIds[0] ? (
        <button type="button" disabled={pending} className="rounded-full border border-red-700/30 px-4 py-2 text-sm font-semibold text-red-900" onClick={() => start(() => flagRuleSourceStaleAction(sourceIds[0]))}>
          Flag source stale
        </button>
      ) : null}
    </div>
  );
}
