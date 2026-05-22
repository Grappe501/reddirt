import type { IntelligencePackage } from "./intelligence-types";

export function renderIntelligenceBrief(pkg: IntelligencePackage): string {
  const s = pkg.snapshot;
  return [
    `# Compliance AI intelligence brief`,
    ``,
    `Generated: ${s.generatedAt} · Commit: ${s.commitBase}`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Filing | **${s.filingStatus}** |`,
    `| Completion | ${s.overallPercentComplete}% |`,
    `| QA | ${s.qaScore ?? "—"} (${s.qaStatus ?? "—"}) |`,
    `| Open queue | ${s.openQueueItems} |`,
    `| Batch eligible | ${s.batchEligible} |`,
    `| Rule review | ${s.ruleReviewItems} |`,
    ``,
    `## Diagnosis`,
    pkg.diagnosis.summary,
    ``,
    `## Top 5 critical path`,
    ...pkg.criticalPathV2.actions.slice(0, 5).map((a) => `${a.rank}. **${a.title}** (${a.owner}) — ${a.impact}`),
    ``,
    `## Data quality`,
    `Overall: ${pkg.dataQuality.overallScore}/100`,
    ``,
    `## Unsafe shortcuts (never)`,
    ...s.unsafeShortcuts.slice(0, 8).map((u) => `- ${u.replace(/_/g, " ")}`),
    ``,
    `Regenerate: \`npm run compliance:ai-intelligence\``,
  ].join("\n");
}

export function renderDiagnosisReport(pkg: IntelligencePackage): string {
  return [
    `# Compliance AI diagnosis`,
    ``,
    `Commit ${pkg.diagnosis.commitBase} · Filing **${pkg.diagnosis.filingStatus}**`,
    ``,
    pkg.diagnosis.summary,
    ``,
    ...pkg.diagnosis.items.map(
      (i) => `## ${i.question}\n\n**Answer:** ${i.answer}\n\n**Root cause:** ${i.rootCause}\n\nOwner: ${i.owner} · Severity: ${i.severity}\n`,
    ),
    `Regenerate: \`npm run compliance:ai-diagnose\``,
  ].join("\n");
}

export function renderCriticalPathV2(pkg: IntelligencePackage): string {
  return [
    `# Critical path v2 (top 25)`,
    ``,
    ...pkg.criticalPathV2.actions.map(
      (a) =>
        `### ${a.rank}. ${a.title}\n- Owner: ${a.owner}\n- Impact: ${a.impact} · Urgency: ${a.urgency}\n- Human only: ${a.humanOnly}\n- Route: ${a.href ?? "—"}\n- Command: ${a.command ?? "—"}\n- Filing gain: ${a.filingReadinessGain}\n- Do not: ${a.doNot.join(", ") || "—"}\n`,
    ),
    `Regenerate: \`npm run compliance:ai-critical-path-v2\``,
  ].join("\n");
}

export function renderWorkRouter(pkg: IntelligencePackage): string {
  const lines = [`# Work router`, ``, `Commit ${pkg.workRouter.commitBase}`, ``];
  for (const [role, tasks] of Object.entries(pkg.workRouter.queues)) {
    lines.push(`## ${role}`, ``);
    for (const t of tasks) {
      lines.push(
        `### ${t.priority}. ${t.title}`,
        `- Route: ${t.route}`,
        `- Command: ${t.command ?? "—"}`,
        `- Look at: ${t.whatToLookAt}`,
        `- Decide: ${t.whatToDecide}`,
        `- Done when: ${t.doneCondition}`,
        `- Do not: ${t.whatNotToDo.join("; ") || "—"}`,
        ``,
      );
    }
  }
  lines.push(`Regenerate: \`npm run compliance:ai-work-router\``);
  return lines.join("\n");
}

export function renderDataQuality(pkg: IntelligencePackage): string {
  return [
    `# Data quality report`,
    ``,
    `Overall score: **${pkg.dataQuality.overallScore}/100**`,
    ``,
    `| Domain | Complete % | Confidence | Records | Filing impact |`,
    `|--------|-------------|------------|---------|---------------|`,
    ...pkg.dataQuality.domains.map(
      (d) =>
        `| ${d.domain} | ${d.completeness} | ${d.confidence} | ${d.recordCount} | ${d.filingImpact} |`,
    ),
    ``,
    ...pkg.dataQuality.domains.map(
      (d) => `### ${d.domain}\n${d.missingFieldsSummary}\nEvidence: ${d.sourceEvidence}\n`,
    ),
    `Regenerate: \`npm run compliance:ai-data-quality\``,
  ].join("\n");
}

export function renderFilingPredictor(pkg: IntelligencePackage): string {
  const f = pkg.filingPredictor;
  return [
    `# Filing readiness predictor`,
    ``,
    `Current: **${f.currentStatus}** (honest — not fabricated)`,
    ``,
    `## Current blockers`,
    ...f.currentBlockers.map((b) => `- ${b}`),
    ``,
    `## To yellow`,
    ...f.toYellow.map((b) => `- ${b}`),
    ``,
    `## To green`,
    ...f.toGreen.map((b) => `- ${b}`),
    ``,
    `## Fastest unblockers`,
    ...f.fastestUnblockers.map((b) => `- ${b}`),
    ``,
    `## Scenarios`,
    ...f.scenarios.map((s) => `### ${s.name}\nExpected: ${s.expectedStatus}\n${s.requirements.map((r) => `- ${r}`).join("\n")}\n`),
    `Regenerate: \`npm run compliance:ai-filing-predictor\``,
  ].join("\n");
}

export function renderExceptionResolver(pkg: IntelligencePackage): string {
  return [
    `# Exception resolver (recommendations only)`,
    ``,
    `**No auto-fix.** Human review required for all groups.`,
    ``,
    ...pkg.exceptionResolver.groups.map(
      (g) =>
        `## ${g.category} (${g.count})\n${g.recommendation}\nRoute: ${g.route}\nHuman only: ${g.humanOnly}\n`,
    ),
    `Regenerate: \`npm run compliance:ai-exception-resolver\``,
  ].join("\n");
}

export function renderMemoryLedger(pkg: IntelligencePackage): string {
  const m = pkg.memory;
  return [
    `# AI memory / delta ledger`,
    ``,
    `Commit: ${m.commitBase} · Previous: ${m.previousCommit ?? "none"}`,
    ``,
    `## Deltas`,
    ...m.deltas.map((d) => `- ${d.metric}: ${d.before ?? "—"} → ${d.after} (${d.direction})`),
    ``,
    `## Carry forward`,
    ...m.carryForward.map((c) => `- ${c}`),
    ``,
    `Regenerate: \`npm run compliance:ai-memory\``,
  ].join("\n");
}

export function renderAllBriefDocs(pkg: IntelligencePackage) {
  return {
    intelligenceBrief: renderIntelligenceBrief(pkg),
    diagnosis: renderDiagnosisReport(pkg),
    criticalPathV2: renderCriticalPathV2(pkg),
    workRouter: renderWorkRouter(pkg),
    dataQuality: renderDataQuality(pkg),
    filingPredictor: renderFilingPredictor(pkg),
    exceptionResolver: renderExceptionResolver(pkg),
    memoryLedger: renderMemoryLedger(pkg),
    executive: pkg.briefs.executive,
    operator: pkg.briefs.operator,
    ernie: pkg.briefs.ernie,
    treasurer: pkg.briefs.treasurer,
  };
}
