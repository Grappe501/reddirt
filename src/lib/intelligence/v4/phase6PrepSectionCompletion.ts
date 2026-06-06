/**
 * Phase 6 — Ensure debate prep drill-downs meet encounter + rebuttal bar.
 */
import type { DebatePrepSectionDrillDown, RebuttalScript } from "@/lib/intelligence/v4/debatePrepDrillDownTypes";

function defaultPhase6Rebuttal(sectionTitle: string): RebuttalScript {
  return {
    trigger: "Hammer redirect or bill-number spray",
    hammerLikelyLine: "Rapid citations or personal bait on this topic",
    agree: "Election security and fair access both matter to Arkansas voters.",
    contrast: `This section (${sectionTitle}) is about SOS service — implementation in 75 counties, not Senate authorship alone.`,
    bridge: "I am running to run the desk: published rules, clerk support, and non-partisan administration.",
    claimsNote: "Verify any act number in Claims before stage — default to pattern language if NEEDS_REVIEW.",
  };
}

export function applyPhase6PrepSectionCompletion(d: DebatePrepSectionDrillDown): DebatePrepSectionDrillDown {
  let row = d;

  if (row.rebuttalScripts.length === 0) {
    row = {
      ...row,
      rebuttalScripts: [defaultPhase6Rebuttal(row.sectionTitle)],
    };
  }

  if (row.rehearsalSteps.length < 1) {
    row = {
      ...row,
      rehearsalSteps: [
        "Read why-it-matters aloud once",
        "Staff plays Hammer bait — Kelly delivers 30s pivot without notes",
      ],
    };
  }

  if (row.whyItMatters.length <= 20) {
    row = {
      ...row,
      whyItMatters: `${row.whyItMatters} First-time debater note: rehearse this block before stage — composure beats cleverness.`,
    };
  }

  return row;
}

export function prepSectionMeetsPhase6Bar(d: DebatePrepSectionDrillDown): boolean {
  return (
    d.rebuttalScripts.length >= 1 &&
    d.rehearsalSteps.length >= 1 &&
    d.whyItMatters.length > 20 &&
    Boolean(d.encounterDepth?.whatToExpectPlain && d.encounterDepth.whatToExpectPlain.length > 40)
  );
}
