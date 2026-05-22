import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildComplianceExpertBundle } from "./build-compliance-expert";
import { buildComplianceUxAudit } from "./build-ux-audit";

const AI_DIR = path.join(process.cwd(), "data", "compliance", "ai");

export async function writeComplianceExpertArtifacts(): Promise<{
  expertPath: string;
  progressPath: string;
  briefPath: string;
  expert: Awaited<ReturnType<typeof buildComplianceExpertBundle>>["expert"];
}> {
  const bundle = await buildComplianceExpertBundle();
  const uxAudit = buildComplianceUxAudit();

  await mkdir(AI_DIR, { recursive: true });

  const expertPath = path.join(AI_DIR, "expert-snapshot.json");
  const progressPath = path.join(AI_DIR, "completion-progress.json");

  await Promise.all([
    writeFile(expertPath, JSON.stringify(bundle.expert, null, 2), "utf8"),
    writeFile(progressPath, JSON.stringify(bundle.progress, null, 2), "utf8"),
    writeFile(path.join(AI_DIR, "operator-coach.json"), JSON.stringify(bundle.operatorCoach, null, 2), "utf8"),
    writeFile(path.join(AI_DIR, "filing-coach.json"), JSON.stringify(bundle.filingCoach, null, 2), "utf8"),
    writeFile(path.join(AI_DIR, "rule-coach.json"), JSON.stringify(bundle.ruleCoach, null, 2), "utf8"),
    writeFile(path.join(AI_DIR, "reconciliation-coach.json"), JSON.stringify(bundle.reconciliationCoach, null, 2), "utf8"),
    writeFile(path.join(AI_DIR, "ux-audit.json"), JSON.stringify(uxAudit, null, 2), "utf8"),
  ]);

  const briefPath = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_AI_EXPERT_BRIEF.md");
  await writeFile(briefPath, buildExpertBrief(bundle.expert, bundle.progress), "utf8");

  return { expertPath, progressPath, briefPath, expert: bundle.expert };
}

function buildExpertBrief(
  expert: Awaited<ReturnType<typeof buildComplianceExpertBundle>>["expert"],
  progress: Awaited<ReturnType<typeof buildComplianceExpertBundle>>["progress"],
): string {
  return `# Compliance AI expert brief

Generated: ${expert.generatedAt}  
Commit: ${expert.commitBase}  
Overall completion: **${progress.overallPercentComplete}%** across ${progress.areas.length} areas

> Not legal advice. Human review required. Green only when source-backed.

## Launch

- **Status:** ${expert.launchOverall} (${expert.launchReadinessScore}% checklist)

## Top 5 now

${expert.top5Now.map((a, i) => `${i + 1}. **${a.title}** (${a.owner}) — ${a.description}`).join("\n")}

## Top 5 risks

${expert.top5Risks.map((r) => `- **${r.severity}** ${r.title}`).join("\n")}

## Next best workflow

${expert.nextBestWorkflow}

## Next human / AI

- **Human:** ${expert.recommendedNextHumanAction}
- **AI:** ${expert.recommendedNextAiAction}

## What would make filing green

${expert.whatWouldMakeFilingGreen.map((l) => `- ${l}`).join("\n")}

## Must not do

${expert.mustNotDo.map((u) => `- ${u.replace(/_/g, " ")}`).join("\n")}

## Outputs

- \`data/compliance/ai/expert-snapshot.json\`
- \`data/compliance/ai/completion-progress.json\`
- \`data/compliance/ai/*-coach.json\`
- \`data/compliance/ai/ux-audit.json\`

Regenerate: \`npm run compliance:ai-expert\`
`;
}
