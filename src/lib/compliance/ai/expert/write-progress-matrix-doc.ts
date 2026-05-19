import type { CompletionProgress } from "./compliance-expert-types";

export function buildProgressMatrixMarkdown(progress: CompletionProgress): string {
  const header = `# Compliance progress matrix

Generated: ${progress.generatedAt} · Commit: ${progress.commitBase} · **Overall: ${progress.overallPercentComplete}%**

> Regenerate live metrics: \`npm run compliance:ai-progress-chart\` and \`npm run compliance:ai-expert\`. Percentages are heuristic — honest status beats fake green.

| Area | Purpose | Status | % | Complete work | Started incomplete | Needs hardening | Missing for 100% | Immediate improvement | Owner | Launch |
|------|---------|--------|---|---------------|-------------------|-----------------|------------------|----------------------|-------|--------|
`;

  const rows = progress.areas
    .map((a) => {
      const purpose = a.completionActions[0]?.slice(0, 40) ?? "See completion plan";
      const complete = a.percentComplete >= 80 ? "Core built" : "Partial";
      const started = a.status === "in_progress" ? (a.blockers[0] ?? "In progress") : "—";
      const harden = a.immediateActions[0] ?? "—";
      const missing = a.completionActions.join("; ").slice(0, 50);
      const immediate = a.immediateActions[0] ?? "—";
      return `| ${a.area} | ${purpose} | ${a.status} | ${a.percentComplete} | ${complete} | ${started} | ${harden} | ${missing} | ${immediate} | ${a.owner} | ${a.launchCriticality} |`;
    })
    .join("\n");

  return `${header}${rows}

## Top 10 risks (program)

1. Bank CSV missing blocks reconciliation and filing path  
2. 133 open approvals — human throughput  
3. 24 unverified rule topics — rule_review guard  
4. Filing red — do not export  
5. Zero batch eligible — intentional until ≥98% confidence  
6. Production storage/RLS not verified  
7. DB migration not applied — JSON authority  
8. Netlify deploy not operator-verified  
9. PII leak risk in exports/commits  
10. Fake green via automation — guarded by AI expert unsafe list  

## Launch completion checklist

- [ ] bank-april-2026.csv validated  
- [ ] Reconciliation unmatched resolved  
- [ ] Rule topics reviewed on Rules page  
- [ ] Approval queue burned down  
- [ ] Filing readiness green (source-backed)  
- [ ] Supabase private storage + RLS  
- [ ] Operator launch rehearsal pass  
- [ ] Netlify production verify  
- [ ] Treasurer/compliance sign-off  

See \`COMPLIANCE_MARKET_READINESS_PLAN.md\` and \`COMPLIANCE_COMPLETION_PLAN.md\`.
`;
}
