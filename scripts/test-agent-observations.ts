/**
 * Agent Intelligence Sprint 2 — observation / orchestration dry-run.
 * No secrets; safe sample observation only.
 */
import { composeCrossDomainContext } from "../src/lib/agents/orchestration/cross-domain-context-composer";
import { buildMemoryCandidatesFromObservations } from "../src/lib/agents/memory/agent-memory-write-planner";
import { recordSafeObservation } from "../src/lib/agents/user-intelligence/record-observation-safe";
import {
  appendGlobalUserObservation,
  loadGlobalUserObservations,
} from "../src/lib/agents/user-intelligence/user-observations";
import { detectWorkflowFriction } from "../src/lib/agents/user-intelligence/workflow-friction-detector";

const SAMPLE = {
  event: "page_viewed" as const,
  role: "operator",
  pathname: "/admin/ai-command-center",
  meta: { dryRun: true, sprint: 2 },
};

function main() {
  console.log("Agent observation test (dry-run)\n");

  const before = loadGlobalUserObservations().length;
  const entry = recordSafeObservation(SAMPLE, "test-script");
  console.log("Appended observation:", entry.id, entry.event);

  const all = loadGlobalUserObservations();
  console.log("Total observations:", all.length, `(+${all.length - before})`);
  console.log("Latest:", all.slice(-3).map((o) => `${o.at} ${o.event} ${o.pathname ?? ""}`).join("\n  "));

  const ctx = composeCrossDomainContext({
    role: "campaign_manager",
    pathname: "/admin/campaign-manager-dashboard",
    period: "2026-04",
    recentObservations: all.slice(-12),
  });
  console.log("\nCross-domain summary:", ctx.contextSummary);
  console.log("Active domain:", ctx.activeDomain);
  console.log("Blockers:", ctx.currentBlockers.join("; ") || "(none)");
  console.log("Primary next:", ctx.recommendedNextActions.primary.title);

  const friction = detectWorkflowFriction(all);
  console.log("\nFriction signals:", friction.length);
  for (const f of friction.slice(0, 3)) {
    console.log(`  - ${f.frictionType} (${f.severity}) @ ${f.affectedRoute}`);
  }

  const memory = buildMemoryCandidatesFromObservations(all, 5);
  console.log("\nMemory candidates:", memory.length);
  for (const m of memory.slice(0, 3)) {
    console.log(`  - ${m.memoryType ?? "—"} risk=${m.riskLevel} review=${m.requiresHumanReview}`);
  }

  console.log("\nPrivacy: metadata only; clear file at data/campaign-events/user-observations.json");
  console.log("OK");
}

main();
