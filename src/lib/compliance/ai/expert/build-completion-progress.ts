import type { ComplianceBrainSnapshot } from "../brain/compliance-brain-types";
import type { CompletionProgress, CompletionProgressArea } from "./compliance-expert-types";

function area(
  partial: Omit<CompletionProgressArea, "percentComplete" | "status" | "relatedScripts" | "relatedDocs"> & {
    percentComplete: number;
    status: CompletionProgressArea["status"];
    relatedScripts?: string[];
    relatedDocs?: string[];
  },
): CompletionProgressArea {
  return {
    relatedScripts: [],
    relatedDocs: [],
    ...partial,
  };
}

export function buildCompletionProgress(snapshot: ComplianceBrainSnapshot): CompletionProgress {
  const s = snapshot.source;
  const q = snapshot.queue;
  const f = snapshot.filing;
  const st = snapshot.storage;
  const db = snapshot.dbMigration;
  const rules = snapshot.rules;
  const launch = snapshot.launchReadiness;

  const bankPct = s.bankCsv === "present" ? 100 : s.bankCsv === "invalid" ? 40 : 15;
  const gcPct = s.goodChangeCsv === "present" ? 95 : 0;
  const filingPct = f.overall === "green" ? 100 : f.overall === "yellow" ? 50 : Math.max(5, 100 - f.blockerCount * 12);
  const queuePct = q.openItems === 0 ? 100 : Math.max(5, Math.round(((q.totalItems - q.openItems) / Math.max(q.totalItems, 1)) * 100));
  const rulesPct = rules.unverifiedTopicCount === 0 ? 100 : Math.max(10, 100 - rules.unverifiedTopicCount * 3);
  const storagePct = st.ready ? 100 : st.mode === "local_private" ? 45 : 20;
  const aiBrainPct = 85;
  const aiExpertPct = 75;
  const uxPct = 70;
  const marketPct = launch.launchReadinessScore;

  const areas: CompletionProgressArea[] = [
    area({
      area: "Source intake",
      percentComplete: Math.round((gcPct + bankPct) / 2),
      status: s.bankCsv === "missing" || s.bankCsv === "invalid" ? "blocked" : "in_progress",
      blockers:
        s.bankCsv === "missing"
          ? ["Bank source missing (file or import chunks)"]
          : s.bankCsv === "invalid"
            ? ["Bank chunks or file need validation"]
            : [],
      immediateActions:
        s.bankCsv === "invalid"
          ? ["Run compliance:source-truth-audit", "Fix bank import validation"]
          : ["Add bank-april-2026.csv or admin bank import", "Confirm April26 folder inventory"],
      completionActions: ["All April26 sources validated", "bank:qa ok", "april26:qa ok"],
      launchCriticality: "critical",
      owner: "treasurer",
      route: "/admin/compliance/april26",
      relatedScripts: ["compliance:april26:qa", "compliance:bank:qa"],
      relatedDocs: ["COMPLIANCE_COMPLETION_PLAN.md"],
    }),
    area({
      area: "April26 import desk",
      percentComplete: s.april26FolderExists && s.goodChangeCsv === "present" ? 80 : 30,
      status: s.april26FolderExists ? "in_progress" : "blocked",
      blockers: !s.april26FolderExists
        ? ["April26 folder missing"]
        : s.bankCsv === "missing" || s.bankCsv === "invalid"
          ? ["Bank source not ready"]
          : [],
      immediateActions: ["Open April26 desk", "Review rehearsal counts"],
      completionActions: ["Bank validated on desk", "Reconciliation rehearsal run"],
      launchCriticality: "critical",
      owner: "operator",
      route: "/admin/compliance/april26",
      relatedScripts: ["compliance:april26:dry"],
      relatedDocs: ["COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md"],
    }),
    area({
      area: "Bank source",
      percentComplete: bankPct,
      status: s.bankCsv === "present" ? "complete" : s.bankCsv === "invalid" ? "in_progress" : "blocked",
      blockers:
        s.bankCsv === "missing"
          ? [`No usable bank at ${s.bankCsvExpectedPath} or imports/bank`]
          : s.bankCsv === "invalid"
            ? ["Import chunks or CSV present but not valid for reconciliation"]
            : [],
      immediateActions:
        s.bankCsv === "invalid"
          ? ["Run compliance:source-truth-audit", "Fix staged bank rows"]
          : ["Treasurer adds bank-april-2026.csv or imports via admin bank import"],
      completionActions: ["compliance:bank:qa status ok", "readyForReconciliation true"],
      launchCriticality: "critical",
      owner: "treasurer",
      route: "/admin/compliance/april26",
      relatedScripts: ["compliance:bank:qa"],
      relatedDocs: ["BANK_RECONCILIATION_ASSESSMENT.md"],
    }),
    area({
      area: "GoodChange CSV",
      percentComplete: gcPct,
      status: s.goodChangeCsv === "present" ? "in_progress" : "blocked",
      blockers: s.goodChangeCsv === "missing" ? ["GoodChange CSV missing"] : [],
      immediateActions: ["Verify 52 rows staged in April26"],
      completionActions: ["Contributions approved in queue"],
      launchCriticality: "critical",
      owner: "operator",
      route: "/admin/compliance/imports/goodchange",
      relatedScripts: ["compliance:analyze-goodchange"],
      relatedDocs: ["GOODCHANGE_IMPORT_ASSESSMENT.md"],
    }),
    area({
      area: "Receipts/checks/in-kind evidence",
      percentComplete: s.receiptImages && s.checkImages ? 75 : 40,
      status: "in_progress",
      blockers: [],
      immediateActions: ["Match receipt images to expense approvals"],
      completionActions: ["Evidence linked for each expense/check/in-kind item"],
      launchCriticality: "high",
      owner: "operator",
      route: "/admin/compliance/receipts",
      relatedScripts: ["compliance:qa-receipts"],
      relatedDocs: [],
    }),
    area({
      area: "Ethics workbook",
      percentComplete: s.ethicsWorkbook === "present" ? 100 : 10,
      status: s.ethicsWorkbook === "present" ? "complete" : "not_started",
      blockers: [],
      immediateActions: ["Add workbook if campaign uses it"],
      completionActions: ["Optional source present or waived by policy"],
      launchCriticality: "low",
      owner: "human",
      route: "/admin/compliance/april26",
      relatedScripts: [],
      relatedDocs: [],
    }),
    area({
      area: "Reconciliation",
      percentComplete: s.bankCsv === "present" ? 50 : 25,
      status: s.reconciliationBlockers ? "blocked" : "in_progress",
      blockers:
        s.bankCsv === "missing" || s.bankCsv === "invalid"
          ? ["Validated bank source required"]
          : s.reconciliationBlockers
            ? [`${s.reconciliationBlockers} blocker(s)`]
            : [],
      immediateActions: ["Run bank rehearsal", "Open reconciliation workbench"],
      completionActions: ["Unmatched lists resolved or accepted with notes"],
      launchCriticality: "critical",
      owner: "treasurer",
      route: "/admin/compliance/reconciliation",
      relatedScripts: ["compliance:qa-reconciliation"],
      relatedDocs: ["RECONCILIATION_WORKBENCH.md"],
    }),
    area({
      area: "Approval queues",
      percentComplete: queuePct,
      status: q.openItems ? "in_progress" : "complete",
      blockers: q.openItems ? [`${q.openItems} open items`] : [],
      immediateActions: ["Start burn-down: " + (q.startOrder[0] ?? "rule_review")],
      completionActions: ["Open count 0 or documented exceptions"],
      launchCriticality: "critical",
      owner: "operator",
      route: "/admin/compliance/approval/april-2026-compliance-review",
      relatedScripts: ["compliance:approval:build", "compliance:operator-review-export-v2"],
      relatedDocs: [],
    }),
    area({
      area: "Workbench review",
      percentComplete: 78,
      status: "in_progress",
      blockers: ["133 items need per-item human decision"],
      immediateActions: ["Use Review next best item"],
      completionActions: ["Each item approved/needs_info/rejected with initials"],
      launchCriticality: "critical",
      owner: "operator",
      route: "/admin/compliance/approval",
      relatedScripts: ["compliance:qa-approval"],
      relatedDocs: ["COMPLIANCE_OPERATOR_SMOKE_TEST.md"],
    }),
    area({
      area: "Batch approval",
      percentComplete: q.batchEligible > 0 ? 80 : 40,
      status: "in_progress",
      blockers: ["Batch eligible 0 by design until confidence ≥98% and no rule_review"],
      immediateActions: ["Fix fields/evidence on near-eligible items"],
      completionActions: ["Batch page shows eligible >0 for safe items only"],
      launchCriticality: "medium",
      owner: "operator",
      route: "/admin/compliance/approval/batch",
      relatedScripts: ["compliance:qa-approval"],
      relatedDocs: [],
    }),
    area({
      area: "Rule review",
      percentComplete: q.ruleReviewItems ? 35 : 90,
      status: "in_progress",
      blockers: [`${q.ruleReviewItems} rule_review queue items`],
      immediateActions: ["Review topics on Rules page first"],
      completionActions: ["Per-item approve with override only after topic review"],
      launchCriticality: "critical",
      owner: "human",
      route: "/admin/compliance/rules",
      relatedScripts: ["compliance:rule-topic-packet"],
      relatedDocs: ["COMPLIANCE_RULE_TOPIC_REVIEW_PACKET.md"],
    }),
    area({
      area: "Rule topic packet",
      percentComplete: rulesPct,
      status: rules.unverifiedTopicCount ? "in_progress" : "complete",
      blockers: rules.unverifiedTopicCount ? [`${rules.unverifiedTopicCount} unverified topics`] : [],
      immediateActions: ["npm run compliance:rule-topic-packet"],
      completionActions: ["unverifiedCount 0"],
      launchCriticality: "high",
      owner: "human",
      route: "/admin/compliance/rules",
      relatedScripts: ["compliance:rule-topic-packet"],
      relatedDocs: ["COMPLIANCE_RULE_TOPIC_REVIEW_PACKET.md"],
    }),
    area({
      area: "Filing readiness",
      percentComplete: filingPct,
      status: f.overall === "green" ? "complete" : "blocked",
      blockers: [`Status ${f.overall}`],
      immediateActions: ["Open filing readiness page"],
      completionActions: ["All hard gates green with human sign-off"],
      launchCriticality: "critical",
      owner: "human",
      route: "/admin/compliance/filing-readiness",
      relatedScripts: ["compliance:qa-filing"],
      relatedDocs: ["FILING_EXPORT_FRAMEWORK.md"],
    }),
    area({
      area: "Filing blockers",
      percentComplete: Math.max(0, 100 - f.blockerCount * 14),
      status: f.blockerCount ? "blocked" : "complete",
      blockers: f.blockers.map((b) => b.label),
      immediateActions: f.blockers.slice(0, 2).map((b) => `Resolve: ${b.label}`),
      completionActions: ["Each blocker greenCondition met"],
      launchCriticality: "critical",
      owner: "human",
      route: "/admin/compliance/filing-readiness",
      relatedScripts: ["compliance:qa-filing"],
      relatedDocs: [],
    }),
    area({
      area: "Storage/evidence protection",
      percentComplete: storagePct,
      status: st.ready ? "complete" : "in_progress",
      blockers: !st.ready ? [st.summary.slice(0, 120)] : [],
      immediateActions: ["Review settings storage panel"],
      completionActions: ["Private storage verified", "No public evidence URLs"],
      launchCriticality: "critical",
      owner: "steve",
      route: "/admin/compliance/settings#storage-setup",
      relatedScripts: ["compliance:storage-preflight", "compliance:qa-storage"],
      relatedDocs: ["COMPLIANCE_SUPABASE_STORAGE_PRODUCTION_CHECKLIST.md"],
    }),
    area({
      area: "Supabase production storage",
      percentComplete: st.envPresent && st.bucketReachable ? 70 : st.mode === "local_private" ? 25 : 15,
      status: "not_started",
      blockers: ["SUPABASE env not configured", "RLS not manually verified"],
      immediateActions: ["Configure Netlify env vars"],
      completionActions: ["storage-preflight ready:true", "RLS checklist signed"],
      launchCriticality: "critical",
      owner: "steve",
      route: "/admin/compliance/settings#storage-setup",
      relatedScripts: ["compliance:storage-preflight"],
      relatedDocs: ["SUPABASE_PRIVATE_STORAGE_SETUP.md"],
    }),
    area({
      area: "DB migration",
      percentComplete: db.migrated ? 100 : 20,
      status: db.migrated ? "complete" : "not_started",
      blockers: ["Steve approval required", "JSON still authoritative"],
      immediateActions: ["Read migration execution plan"],
      completionActions: ["Backup, rehearsal, cutover, post-migration QA"],
      launchCriticality: "medium",
      owner: "steve",
      route: "/admin/compliance/settings",
      relatedScripts: [],
      relatedDocs: ["COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md"],
    }),
    area({
      area: "AI brain",
      percentComplete: aiBrainPct,
      status: "in_progress",
      blockers: [],
      immediateActions: ["npm run compliance:ai-brain"],
      completionActions: ["Brain QA passes", "Handoff includes snapshot"],
      launchCriticality: "high",
      owner: "ai_assist",
      route: "/admin/compliance/command-center",
      relatedScripts: ["compliance:ai-brain", "compliance:ai-brain:qa"],
      relatedDocs: ["COMPLIANCE_AI_BRAIN_BRIEF.md"],
    }),
    area({
      area: "AI next actions",
      percentComplete: aiBrainPct,
      status: "in_progress",
      blockers: [],
      immediateActions: ["compliance:ai-next-actions"],
      completionActions: ["Actions match live blockers"],
      launchCriticality: "high",
      owner: "ai_assist",
      relatedScripts: ["compliance:ai-next-actions"],
      relatedDocs: [],
    }),
    area({
      area: "AI risk register",
      percentComplete: aiBrainPct,
      status: "in_progress",
      blockers: [],
      immediateActions: ["compliance:ai-risk-report"],
      completionActions: ["Critical risks have mitigations"],
      launchCriticality: "high",
      owner: "ai_assist",
      relatedScripts: ["compliance:ai-risk-report"],
      relatedDocs: [],
    }),
    area({
      area: "AI launch readiness",
      percentComplete: launch.launchReadinessScore,
      status: launch.overall === "launch_ready" ? "complete" : "blocked",
      blockers: launch.checklist.filter((c) => !c.passed && c.requiredForLaunch).map((c) => c.label),
      immediateActions: ["compliance:ai-launch-readiness"],
      completionActions: ["Checklist 100% for launch_ready"],
      launchCriticality: "critical",
      owner: "ai_assist",
      relatedScripts: ["compliance:ai-launch-readiness"],
      relatedDocs: ["COMPLIANCE_MARKET_READINESS_PLAN.md"],
    }),
    area({
      area: "AI handoff",
      percentComplete: 90,
      status: "in_progress",
      blockers: [],
      immediateActions: ["compliance:ai-thread-handoff"],
      completionActions: ["New threads get full context"],
      launchCriticality: "medium",
      owner: "ai_assist",
      relatedScripts: ["compliance:ai-thread-handoff"],
      relatedDocs: ["COMPLIANCE_AI_THREAD_HANDOFF.md"],
    }),
    area({
      area: "Command center",
      percentComplete: 88,
      status: "in_progress",
      blockers: ["Operator rehearsal and Netlify verify pending"],
      immediateActions: ["Open command center daily"],
      completionActions: ["Operator uses CC as home base without training"],
      launchCriticality: "critical",
      owner: "operator",
      route: "/admin/compliance/command-center",
      relatedScripts: ["compliance:ai-expert"],
      relatedDocs: ["COMPLIANCE_UX_WORLD_CLASS_PLAN.md"],
    }),
    area({
      area: "Operator exports",
      percentComplete: 85,
      status: "in_progress",
      blockers: [],
      immediateActions: ["operator-review-export-v2"],
      completionActions: ["Burn-down export drives daily work"],
      launchCriticality: "high",
      owner: "operator",
      relatedScripts: ["compliance:operator-review-export-v2"],
      relatedDocs: [],
    }),
    area({
      area: "Operator smoke test",
      percentComplete: 60,
      status: "in_progress",
      blockers: ["Not run on production yet"],
      immediateActions: ["Walk COMPLIANCE_OPERATOR_SMOKE_TEST.md locally"],
      completionActions: ["All smoke steps pass in browser"],
      launchCriticality: "high",
      owner: "operator",
      relatedDocs: ["COMPLIANCE_OPERATOR_SMOKE_TEST.md"],
    }),
    area({
      area: "Launch rehearsal",
      percentComplete: 55,
      status: "in_progress",
      blockers: ["Bank CSV missing"],
      immediateActions: ["COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md"],
      completionActions: ["Pass/fail checklist complete"],
      launchCriticality: "critical",
      owner: "operator",
      relatedDocs: ["COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md"],
    }),
    area({
      area: "Netlify production verification",
      percentComplete: 10,
      status: "not_started",
      blockers: ["Deploy not operator-verified"],
      immediateActions: ["COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md"],
      completionActions: ["Checklist signed after deploy"],
      launchCriticality: "critical",
      owner: "operator",
      relatedDocs: ["COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md"],
    }),
    area({
      area: "UI/UX clarity",
      percentComplete: uxPct,
      status: "in_progress",
      blockers: ["Tables still dense on queue page"],
      immediateActions: ["Use shared What this means / Do this next panels"],
      completionActions: ["UX plan implemented per route"],
      launchCriticality: "high",
      owner: "engineering",
      relatedDocs: ["COMPLIANCE_UX_WORLD_CLASS_PLAN.md"],
    }),
    area({
      area: "Accessibility",
      percentComplete: 40,
      status: "not_started",
      blockers: ["No formal a11y audit"],
      immediateActions: ["Nav aria-label present", "Expand keyboard focus pass"],
      completionActions: ["WCAG spot-check on compliance routes"],
      launchCriticality: "medium",
      owner: "engineering",
      relatedDocs: [],
    }),
    area({
      area: "Audit trail",
      percentComplete: 70,
      status: "in_progress",
      blockers: [],
      immediateActions: ["Verify initials on approvals"],
      completionActions: ["Export audit log for filing period"],
      launchCriticality: "high",
      owner: "operator",
      route: "/admin/compliance/approval",
      relatedDocs: [],
    }),
    area({
      area: "Security/privacy",
      percentComplete: 75,
      status: "in_progress",
      blockers: ["Production RLS not verified"],
      immediateActions: ["Confirm gitignore for tasks JSON"],
      completionActions: ["No PII in repo or public exports"],
      launchCriticality: "critical",
      owner: "steve",
      relatedDocs: ["COMPLIANCE_AI_OPERATING_MODEL.md"],
    }),
    area({
      area: "Documentation",
      percentComplete: 88,
      status: "in_progress",
      blockers: [],
      immediateActions: ["Keep STATE_OF_BUILD current"],
      completionActions: ["All phases documented with exit criteria"],
      launchCriticality: "high",
      owner: "engineering",
      relatedDocs: ["COMPLIANCE_STATE_OF_BUILD.md", "COMPLIANCE_COMPLETION_PLAN.md"],
    }),
    area({
      area: "QA automation",
      percentComplete: 82,
      status: "in_progress",
      blockers: ["qa-full yellow 66"],
      immediateActions: ["npm run compliance:qa-full"],
      completionActions: ["qa-full green when real gates pass"],
      launchCriticality: "high",
      owner: "engineering",
      relatedScripts: ["compliance:qa-full"],
      relatedDocs: [],
    }),
    area({
      area: "Market readiness",
      percentComplete: marketPct,
      status: launch.overall === "launch_ready" ? "complete" : "blocked",
      blockers: launch.checklist.filter((c) => !c.passed).map((c) => c.label),
      immediateActions: ["COMPLIANCE_MARKET_READINESS_PLAN.md"],
      completionActions: ["Demo + operator + filing + public launch gates"],
      launchCriticality: "critical",
      owner: "human",
      relatedDocs: ["COMPLIANCE_MARKET_READINESS_PLAN.md"],
    }),
    area({
      area: "AI expert v2",
      percentComplete: 85,
      status: "in_progress",
      blockers: ["Coaches need live bank data to be fully actionable"],
      immediateActions: ["npm run compliance:ai-expert"],
      completionActions: ["Expert QA passes", "Operators use coach steps daily"],
      launchCriticality: "high",
      owner: "ai_assist",
      relatedScripts: ["compliance:ai-expert", "compliance:ai-expert:qa"],
      relatedDocs: ["COMPLIANCE_AI_EXPERT_BRIEF.md"],
    }),
  ];

  const overallPercentComplete = Math.round(areas.reduce((sum, a) => sum + a.percentComplete, 0) / areas.length);

  return {
    generatedAt: new Date().toISOString(),
    commitBase: snapshot.commitBase,
    overallPercentComplete,
    areas,
  };
}
