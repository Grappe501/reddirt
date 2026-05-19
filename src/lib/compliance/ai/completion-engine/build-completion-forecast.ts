import type { buildCompletionContext } from "./build-completion-context";

type Ctx = Awaited<ReturnType<typeof buildCompletionContext>>;

export function buildCompletionForecast(ctx: Ctx) {
  const base = ctx.progress.overallPercentComplete;
  const steps = [
    {
      step: "Complete April audit checklist (human)",
      realisticPercentAfter: Math.min(85, base + 18),
      blockedByHumanSource: true,
      note: "Requires physical checks + bank CSV compare",
    },
    {
      step: "Treasurer reconciliation decisions",
      realisticPercentAfter: Math.min(80, base + 12),
      blockedByTreasurer: true,
      note: `${ctx.recon.remainingReviewItems} items`,
    },
    {
      step: "Rule topic reviews (no batch approve)",
      realisticPercentAfter: Math.min(75, base + 8),
      blockedByComplianceOfficer: true,
      note: `${ctx.rules.topicsPendingReview} topics`,
    },
    {
      step: "Vendor/address completion (confirmed payees only)",
      realisticPercentAfter: Math.min(90, base + 22),
      blockedByHumanSource: true,
      note: `${ctx.inventory.summary.missingAddressCount} flags — no guessing`,
    },
    {
      step: "Production bank verified on Netlify",
      realisticPercentAfter: Math.min(78, base + 10),
      blockedByTreasurer: true,
      note: "Re-import + verify",
    },
    {
      step: "Supabase storage + RLS",
      realisticPercentAfter: Math.min(82, base + 15),
      blockedBySteve: true,
      note: "Steve approval",
    },
    {
      step: "Final filing QA green",
      realisticPercentAfter: 95,
      blockedByAllGates: true,
      note: "Only when honest gates pass",
    },
  ];
  return {
    generatedAt: new Date().toISOString(),
    commitBase: ctx.brain.commitBase,
    currentPercent: base,
    filingStatus: ctx.brain.filing.overall,
    steps,
    fastestPathSummary: steps.slice(0, 4).map((s) => s.step).join(" → "),
  };
}
