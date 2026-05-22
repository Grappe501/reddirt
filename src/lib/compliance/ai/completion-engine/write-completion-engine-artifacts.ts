import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildCompletionEnginePackage } from "./build-completion-engine";
import { buildAprilAuditChecklist, renderAprilAuditChecklistMarkdown } from "./build-april-audit-checklist";
import { buildWeaknessDiscovery, renderWeaknessReportMd } from "./build-weakness-discovery";
import { buildStateProgress, renderStateProgressMd } from "./build-state-progress";
import { buildHardeningAudit, renderHardeningAuditMd } from "./build-hardening-audit";
import { completionEngineSchema } from "./completion-engine-types";
import { buildCompletionContext } from "./build-completion-context";
import { buildBlockerGraph } from "./build-blocker-graph";
import { buildCriticalPath } from "./build-critical-path";
import { buildWorkSequencer } from "./build-work-sequencer";
import { buildCompletionForecast } from "./build-completion-forecast";
import { buildFocusBrief } from "./build-focus-brief";

const AI_DIR = path.join(process.cwd(), "data", "compliance", "ai");
const DOCS = path.join(process.cwd(), "docs", "compliance");

async function writeJson(name: string, data: unknown) {
  await mkdir(AI_DIR, { recursive: true });
  await writeFile(path.join(AI_DIR, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeDoc(name: string, content: string) {
  await mkdir(DOCS, { recursive: true });
  await writeFile(path.join(DOCS, name), content, "utf8");
}

export async function writeAllCompletionEngineArtifacts() {
  const pkg = await buildCompletionEnginePackage();
  completionEngineSchema.parse(pkg.engine);

  const auditChecklist = buildAprilAuditChecklist(pkg.ctx.inventory);
  const weakness = buildWeaknessDiscovery(pkg.ctx);
  const stateProgress = buildStateProgress(pkg.ctx);
  const hardening = await buildHardeningAudit();

  await Promise.all([
    writeJson("completion-engine.json", pkg.engine),
    writeJson("critical-path.json", pkg.criticalPath),
    writeJson("blocker-graph.json", pkg.blockerGraph),
    writeJson("work-sequencer.json", pkg.workSequencer),
    writeJson("completion-forecast.json", pkg.forecast),
    writeJson("weakness-discovery.json", weakness),
    writeJson("state-progress.json", stateProgress),
    writeJson("hardening-audit.json", hardening),
    writeJson("april-audit-checklist.json", auditChecklist),
    writeDoc("COMPLIANCE_APRIL_AUDIT_CHECKLIST.md", renderAprilAuditChecklistMarkdown(auditChecklist)),
    writeDoc("COMPLIANCE_WEAKNESS_DISCOVERY_REPORT.md", renderWeaknessReportMd(weakness)),
    writeDoc("COMPLIANCE_CURRENT_STATE_AND_PROGRESS.md", renderStateProgressMd(stateProgress)),
    writeDoc("COMPLIANCE_HARDENING_AUDIT_REPORT.md", renderHardeningAuditMd(hardening)),
    writeDoc("COMPLIANCE_AI_COMPLETION_ENGINE_BRIEF.md", renderEngineBrief(pkg)),
  ]);

  return { pkg, auditChecklist, weakness, stateProgress, hardening };
}

export async function writeAprilAuditChecklistOnly() {
  const ctx = await buildCompletionContext();
  const checklist = buildAprilAuditChecklist(ctx.inventory);
  await writeJson("april-audit-checklist.json", checklist);
  await writeDoc("COMPLIANCE_APRIL_AUDIT_CHECKLIST.md", renderAprilAuditChecklistMarkdown(checklist));
  return checklist;
}

export async function writeWeaknessDiscoveryOnly() {
  const ctx = await buildCompletionContext();
  const weakness = buildWeaknessDiscovery(ctx);
  await writeJson("weakness-discovery.json", weakness);
  await writeDoc("COMPLIANCE_WEAKNESS_DISCOVERY_REPORT.md", renderWeaknessReportMd(weakness));
  return weakness;
}

export async function writeStateProgressOnly() {
  const ctx = await buildCompletionContext();
  const state = buildStateProgress(ctx);
  await writeJson("state-progress.json", state);
  await writeDoc("COMPLIANCE_CURRENT_STATE_AND_PROGRESS.md", renderStateProgressMd(state));
  return state;
}

export async function writeBlockerGraphOnly() {
  const ctx = await buildCompletionContext();
  const graph = buildBlockerGraph(ctx);
  await writeJson("blocker-graph.json", graph);
  return graph;
}

export async function writeCriticalPathOnly() {
  const ctx = await buildCompletionContext();
  const pathItems = buildCriticalPath(ctx);
  await writeJson("critical-path.json", pathItems);
  return pathItems;
}

export async function writeWorkSequencerOnly() {
  const ctx = await buildCompletionContext();
  const seq = buildWorkSequencer(ctx);
  await writeJson("work-sequencer.json", seq);
  return seq;
}

export async function writeCompletionForecastOnly() {
  const ctx = await buildCompletionContext();
  const forecast = buildCompletionForecast(ctx);
  await writeJson("completion-forecast.json", forecast);
  return forecast;
}

export async function writeFocusBriefOnly() {
  const ctx = await buildCompletionContext();
  const focus = buildFocusBrief(ctx);
  await writeDoc(
    "COMPLIANCE_AI_FOCUS_BRIEF.md",
    `# AI focus brief\n\n${focus.plainEnglish}\n\n## Today\n\n${focus.today.map((t) => `- ${t}`).join("\n")}\n\n## Do not\n\n${focus.doNotDo.map((t) => `- ${t}`).join("\n")}\n`,
  );
  return focus;
}

export async function writeHardeningAuditOnly() {
  const hardening = await buildHardeningAudit();
  await writeJson("hardening-audit.json", hardening);
  await writeDoc("COMPLIANCE_HARDENING_AUDIT_REPORT.md", renderHardeningAuditMd(hardening));
  return hardening;
}

function renderEngineBrief(pkg: Awaited<ReturnType<typeof buildCompletionEnginePackage>>): string {
  const e = pkg.engine;
  return `# Compliance AI Completion Engine brief

Generated: ${e.generatedAt} · Commit: \`${e.commitBase}\`

## In 30 seconds

${pkg.focus.plainEnglish}

## Next best action

**${e.nextBestAction.title}** (${e.nextBestAction.owner})

${e.nextBestAction.plainEnglish}

- Route: ${e.nextBestAction.href ?? "—"}
- Command: \`${e.nextBestAction.command ?? "—"}\`
- Impact: ${e.nextBestAction.expectedImpact}

## Top blocker

**${e.topBlocker.label}** (${e.topBlocker.owner})

## Progress

- Overall: **${e.overallPercentComplete}%**
- Filing: **${e.filingStatus}**
- QA full: **${e.qaFullStatus}**
- Weaknesses: ${e.weaknessSummary.critical} critical, ${e.weaknessSummary.high} high

## Critical path (top 5)

${e.criticalPath
  .slice(0, 5)
  .map((p) => `${p.rank}. [${p.owner}] ${p.title}`)
  .join("\n")}

## Audit checklist (standing by)

\`npm run compliance:april-audit-checklist\` → **COMPLIANCE_APRIL_AUDIT_CHECKLIST.md**

## Must not automate

${e.mustNotAutomate.map((m) => `- ${m.replace(/_/g, " ")}`).join("\n")}

## Regenerate all

\`npm run compliance:ai-completion-engine\`
`;
}

export async function loadCompletionEngineSummary() {
  try {
    const raw = await readFile(path.join(AI_DIR, "completion-engine.json"), "utf8");
    return completionEngineSchema.parse(JSON.parse(raw));
  } catch {
    const pkg = await buildCompletionEnginePackage();
    return pkg.engine;
  }
}
