import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildOrchestratorPackage } from "./build-orchestrator";
import { writeAiDelta } from "./build-ai-delta";

const AI_DIR = path.join(process.cwd(), "data", "compliance", "ai");
const BRIEF_PATH = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_AI_ORCHESTRATOR_BRIEF.md");
const EXEC_BRIEF_PATH = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_AI_EXECUTIVE_BRIEF.md");

function briefMarkdown(pkg: Awaited<ReturnType<typeof buildOrchestratorPackage>>): string {
  const nba = pkg.snapshot.nextBestAction;
  return `# Compliance AI orchestrator brief

Generated: ${pkg.snapshot.generatedAt} · Commit: \`${pkg.snapshot.commitBase}\`

## Program summary

${pkg.snapshot.programSummary}

## Next best action

**${nba.action.title}** (${nba.action.owner})

${nba.rationale}

- Why: ${nba.action.whyItMatters}
- Expected impact: ${nba.action.estimatedImpact.summary}
- Link: ${nba.action.href ?? "—"}
- Command: \`${nba.action.command ?? "—"}\`

## Today's work plan

${pkg.snapshot.todayWorkPlan.map((t) => `${t.order}. [${t.owner}] ${t.title}`).join("\n")}

## Changes since last pass

${pkg.snapshot.changesSinceLastPass.length ? pkg.snapshot.changesSinceLastPass.map((c) => `- ${c}`).join("\n") : "- (none)"}

## Unsafe shortcuts (never automate)

${pkg.snapshot.unsafeShortcuts.map((u) => `- ${u.replace(/_/g, " ")}`).join("\n")}

## Decision guard

- All guards passed: **${pkg.decisionGuard.allGuardsPassed}**
- Production bank verified: **${pkg.decisionGuard.productionBankAssumption.verified}**
- ${pkg.decisionGuard.productionBankAssumption.note}

## Regenerate

\`\`\`bash
npm run compliance:ai-orchestrator
npm run compliance:ai-orchestrator:qa
\`\`\`
`;
}

function executiveBriefMarkdown(pkg: Awaited<ReturnType<typeof buildOrchestratorPackage>>): string {
  return `# Compliance executive brief (operator-safe)

Generated: ${pkg.snapshot.generatedAt} · Commit: \`${pkg.snapshot.commitBase}\`

| Metric | Value |
|--------|-------|
| Filing | ${pkg.snapshot.filingStatus} |
| Launch | ${pkg.snapshot.launchOverall} |
| Completion | ${pkg.snapshot.overallPercentComplete}% |

## One thing to do now

**${pkg.snapshot.nextBestAction.action.title}** — ${pkg.snapshot.nextBestAction.action.owner}

## Impact if top actions complete (honest ceiling)

${pkg.impactForecast.cumulativeIfAllTop3.honestNote}

Max launch points (heuristic): ~${pkg.impactForecast.cumulativeIfAllTop3.launchReadinessPointsMax}

## Role owners today

${pkg.rolePlans.plans.map((p) => `- **${p.label}**: ${p.todayPlan[0]?.title ?? "—"}`).join("\n")}

## Do not

- Auto-approve anything
- Batch rule_review
- Assume filing green or production bank without verification

No donor PII in this brief.
`;
}

export async function writeOrchestratorArtifacts() {
  const pkg = await buildOrchestratorPackage();
  await mkdir(AI_DIR, { recursive: true });

  const paths = {
    orchestrator: path.join(AI_DIR, "orchestrator.json"),
    impactForecast: path.join(AI_DIR, "impact-forecast.json"),
    rolePlans: path.join(AI_DIR, "role-plans.json"),
    decisionGuard: path.join(AI_DIR, "decision-guard.json"),
    delta: path.join(AI_DIR, "delta.json"),
  };

  await Promise.all([
    writeFile(paths.orchestrator, `${JSON.stringify(pkg.snapshot, null, 2)}\n`, "utf8"),
    writeFile(paths.impactForecast, `${JSON.stringify(pkg.impactForecast, null, 2)}\n`, "utf8"),
    writeFile(paths.rolePlans, `${JSON.stringify(pkg.rolePlans, null, 2)}\n`, "utf8"),
    writeFile(paths.decisionGuard, `${JSON.stringify(pkg.decisionGuard, null, 2)}\n`, "utf8"),
    writeAiDelta(pkg.delta),
    writeFile(BRIEF_PATH, briefMarkdown(pkg), "utf8"),
    writeFile(EXEC_BRIEF_PATH, executiveBriefMarkdown(pkg), "utf8"),
  ]);

  return { ...pkg, paths, briefPath: BRIEF_PATH, executiveBriefPath: EXEC_BRIEF_PATH };
}
