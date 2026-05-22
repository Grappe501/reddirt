import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildComplianceBrainSnapshot,
  buildComplianceNextActions,
  buildComplianceRiskReport,
} from "./build-compliance-brain";

const AI_DIR = path.join(process.cwd(), "data", "compliance", "ai");

export async function writeComplianceBrainArtifacts(): Promise<{
  snapshotPath: string;
  nextActionsPath: string;
  riskReportPath: string;
  launchReadinessPath: string;
  briefPath: string;
  snapshot: Awaited<ReturnType<typeof buildComplianceBrainSnapshot>>;
}> {
  const snapshot = await buildComplianceBrainSnapshot();
  const nextActions = buildComplianceNextActions(snapshot);
  const risks = buildComplianceRiskReport(snapshot);
  const launchReadiness = snapshot.launchReadiness;

  await mkdir(AI_DIR, { recursive: true });

  const snapshotPath = path.join(AI_DIR, "brain-snapshot.json");
  const nextActionsPath = path.join(AI_DIR, "next-actions.json");
  const riskReportPath = path.join(AI_DIR, "risk-report.json");
  const launchReadinessPath = path.join(AI_DIR, "launch-readiness.json");

  await Promise.all([
    writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), "utf8"),
    writeFile(nextActionsPath, JSON.stringify({ generatedAt: snapshot.generatedAt, actions: nextActions }, null, 2), "utf8"),
    writeFile(riskReportPath, JSON.stringify({ generatedAt: snapshot.generatedAt, risks }, null, 2), "utf8"),
    writeFile(launchReadinessPath, JSON.stringify(launchReadiness, null, 2), "utf8"),
  ]);

  const briefPath = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_AI_BRAIN_BRIEF.md");
  const brief = buildBriefMarkdown(snapshot, nextActions, risks);
  await writeFile(briefPath, brief, "utf8");

  return { snapshotPath, nextActionsPath, riskReportPath, launchReadinessPath, briefPath, snapshot };
}

function buildBriefMarkdown(
  snapshot: Awaited<ReturnType<typeof buildComplianceBrainSnapshot>>,
  actions: ReturnType<typeof buildComplianceNextActions>,
  risks: ReturnType<typeof buildComplianceRiskReport>,
): string {
  const topRisks = risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 5);
  const topActions = actions.slice(0, 5);

  return `# Compliance AI brain brief

Generated: ${snapshot.generatedAt}  
Commit: ${snapshot.commitBase}  
Command center: ${snapshot.commandCenterUrl}

> Human review required — not legal certification. Green only when source-backed.

## Launch status

- **Overall:** ${snapshot.launchReadiness.overall} (${snapshot.launchReadiness.launchReadinessScore}% checklist)
- **Filing:** ${snapshot.filing.overall} (${snapshot.filing.blockerCount} blockers)
- **Open queue:** ${snapshot.queue.openItems} · Batch eligible: ${snapshot.queue.batchEligible}
- **Bank CSV:** ${snapshot.source.bankCsv}
- **Rule topics unverified:** ${snapshot.rules.unverifiedTopicCount}

## Recommended next human action

${snapshot.recommendedNextHumanAction}

## Recommended next AI action

${snapshot.recommendedNextAiAction}

## Top next actions

${topActions.map((a, i) => `${i + 1}. **${a.title}** (${a.owner}) — ${a.description}`).join("\n")}

## Top risks

${topRisks.map((r) => `- **${r.severity}** ${r.title}: ${r.mitigation}`).join("\n")}

## Unsafe actions (never automate)

${snapshot.unsafeActions.map((u) => `- ${u}`).join("\n")}

## Machine-readable outputs

- \`data/compliance/ai/brain-snapshot.json\`
- \`data/compliance/ai/next-actions.json\`
- \`data/compliance/ai/risk-report.json\`
- \`data/compliance/ai/launch-readiness.json\`

Regenerate: \`npm run compliance:ai-brain\`
`;
}
