import { readFile } from "node:fs/promises";
import path from "node:path";
import type { IntelligenceContext } from "./gather-intelligence-context";
import { gatherIntelligenceContext } from "./gather-intelligence-context";
import type {
  CriticalPathV2,
  DataQualityReport,
  DiagnosisReport,
  ExceptionResolutionPlan,
  FilingPrediction,
  IntelligenceBriefs,
  IntelligencePackage,
  IntelligenceSnapshot,
  MemoryLedger,
  WorkRouterPlan,
} from "./intelligence-types";
import { ORCHESTRATOR_UNSAFE_SHORTCUTS } from "../orchestrator/orchestrator-types";

const UNSAFE = [...ORCHESTRATOR_UNSAFE_SHORTCUTS, "invent_addresses", "auto_match_uncertain", "fake_filing_green"];

export function buildIntelligenceSnapshot(ctx: IntelligenceContext): IntelligenceSnapshot {
  const { brain, progress } = ctx.completionCtx;
  return {
    generatedAt: new Date().toISOString(),
    commitBase: ctx.commitBase,
    overallPercentComplete: progress.overallPercentComplete,
    filingStatus: brain.filing.overall,
    qaScore: brain.launchReadiness.qaFullScore ?? null,
    qaStatus: brain.launchReadiness.qaFullStatus ?? null,
    launchReadiness: ctx.deploy.readyForNetlifyDeploy ? "deploy_ready" : "not_ready",
    openQueueItems: ctx.openItems.length,
    batchEligible: ctx.batchEligible.length,
    ruleReviewItems: ctx.ruleReview.length,
    sources: {
      bankCsv: brain.source.bankCsv,
      goodChangeRows: ctx.april26.goodChangeRows,
      receiptImages: ctx.april26.receiptImagesFound,
      checkImages: ctx.april26.checkImagesFound,
      inKindPages: ctx.april26.inKindPagesFound,
    },
    auditSpreadsheet: {
      mainRows: ctx.auditCsv.rows,
      present: ctx.auditCsv.present,
      path: "docs/compliance/audit/april-2026-compliance-audit.csv",
    },
    checkWorkbench: {
      totalChecks: ctx.sosStats?.totalChecks ?? 0,
      readyForSos: ctx.sosStats?.readyForSos ?? 0,
      missingRequired: ctx.sosMissing,
      present: Boolean(ctx.workbook),
    },
    inKind: {
      auctionRows: ctx.inKind.rows.length,
      evidencePhotos: ctx.inKindPhotos.length,
      photosApproved: ctx.inKindPhotos.filter((i) => i.status === "approved").length,
    },
    reconciliation: {
      ambiguous: ctx.rehearsal.ambiguous.length,
      unmatchedBank: ctx.rehearsal.unmatchedBank.length,
      remainingReview: ctx.completionCtx.recon.remainingReviewItems,
    },
    inventory: {
      unmatchedChecks: ctx.completionCtx.inventory.summary.unmatchedUploadedChecks,
      unmatchedLedger: ctx.completionCtx.inventory.summary.unmatchedLedgerExpenditures,
      missingAddresses: ctx.completionCtx.inventory.summary.missingAddressCount,
      exactMatches: ctx.completionCtx.inventory.summary.exactMatchCount,
    },
    storageMode: ctx.storage.localFallbackActive ? "local_fallback" : ctx.storage.ready ? "supabase" : "degraded",
    deployReady: ctx.deploy.readyForNetlifyDeploy,
    unsafeShortcuts: UNSAFE,
  };
}

export function buildDiagnosis(ctx: IntelligenceContext, snap: IntelligenceSnapshot): DiagnosisReport {
  const items: DiagnosisReport["items"] = [
    {
      id: "why-filing-red",
      question: "Why is filing red?",
      answer: `${ctx.filingBurnDown.blockers.length} blocker(s) on filing readiness; hard gates and rule coverage incomplete.`,
      rootCause: "Source-backed gates: rules, queue backlog, reconciliation, storage, human sign-off.",
      owner: "compliance_officer",
      severity: "critical",
    },
    {
      id: "why-queue-overwhelming",
      question: "Why does the queue feel overwhelming?",
      answer: `${snap.openQueueItems} open items including ${snap.ruleReviewItems} rule_review rows; batch eligible is ${snap.batchEligible}.`,
      rootCause: "April26 ingest created one row per image/topic; rule_review cannot batch; 98% confidence gate.",
      owner: "operator",
      severity: "high",
    },
    {
      id: "why-batch-zero",
      question: "Why is batch eligible 0?",
      answer: "Confidence threshold ≥98%, rule_review excluded, blockers/evidence required.",
      rootCause: "By design — prevents unsafe mass approval.",
      owner: "ai_assist",
      severity: "medium",
    },
    {
      id: "why-checks-hard",
      question: "Why are checks hard to audit?",
      answer: `${snap.inventory.unmatchedChecks} unmatched checks; images need SOS board extract; ${snap.checkWorkbench.missingRequired} SOS rows missing required fields.`,
      rootCause: "Multi-check photos; approval queue only has reviewNote per image.",
      owner: "ernie",
      severity: "high",
    },
    {
      id: "why-inkind-hard",
      question: "Why are in-kind photos hard to review?",
      answer: `Each photo lists dozens of items; queue has 3 photo rows vs ${snap.inKind.auctionRows} spreadsheet lines.`,
      rootCause: "Wrong tool for line items — use Ozark auction page + audit CSV.",
      owner: "ernie",
      severity: "high",
    },
    {
      id: "why-prod-differs",
      question: "Why may production differ from local?",
      answer: "April26 folder and check workbook JSON are local; Netlify lacks COMPLIANCE_APRIL26_DIR unless synced.",
      rootCause: "Environment data gap — not a logic bug.",
      owner: "steve",
      severity: "high",
    },
  ];
  return {
    generatedAt: snap.generatedAt,
    commitBase: snap.commitBase,
    filingStatus: snap.filingStatus,
    items,
    summary: "Filing red is honest. Overwhelming queue is structural. Use Ernie workflow + audit spreadsheet, not generic queue first.",
  };
}

export function buildCriticalPathV2(ctx: IntelligenceContext, snap: IntelligenceSnapshot): CriticalPathV2 {
  const actions: CriticalPathV2["actions"] = [];
  let rank = 1;
  const add = (a: Omit<CriticalPathV2["actions"][0], "rank">) => {
    actions.push({ rank: rank++, ...a });
  };

  add({
    id: "audit-spreadsheet",
    title: "Complete April audit spreadsheet (human_answer columns)",
    owner: "ernie",
    href: "/admin/compliance/ernie",
    command: "npm run compliance:april-audit-spreadsheet",
    impact: "critical",
    urgency: "immediate",
    dependencyIds: [],
    riskReduction: "Documents every check, ledger line, address, in-kind row",
    filingReadinessGain: "Enables verified documentation pass",
    launchReadinessGain: "Operator clarity +15–20%",
    humanOnly: true,
    doNot: ["invent_addresses", "auto_approve_rule_review"],
  });

  add({
    id: "sos-checks",
    title: "Extract and verify all physical checks on SOS board",
    owner: "ernie",
    href: "/admin/compliance/checks/sos-entry",
    command: null,
    impact: "critical",
    urgency: "immediate",
    dependencyIds: [],
    riskReduction: "Closes donation check documentation gap",
    filingReadinessGain: "Contribution records defensible",
    launchReadinessGain: "Check workstream unblocked",
    humanOnly: true,
    doNot: ["copy_unverified_fields_to_sos"],
  });

  add({
    id: "ozark-inkind",
    title: "Enter Ozark auction in-kind lines in SOS",
    owner: "ernie",
    href: "/admin/compliance/in-kind/ozark-auction",
    command: "npm run compliance:in-kind-audit-export",
    impact: "high",
    urgency: "immediate",
    dependencyIds: ["audit-spreadsheet"],
    riskReduction: "49 auction lines documented",
    filingReadinessGain: "In-kind reporting path clear",
    launchReadinessGain: "In-kind workstream progress",
    humanOnly: true,
    doNot: [],
  });

  add({
    id: "recon-treasurer",
    title: "Resolve ambiguous and unmatched bank credits",
    owner: "treasurer",
    href: "/admin/compliance/reconciliation",
    command: "npm run compliance:reconciliation-review-report",
    impact: "high",
    urgency: "this_week",
    dependencyIds: [],
    riskReduction: `${snap.reconciliation.ambiguous + snap.reconciliation.unmatchedBank} bank exceptions`,
    filingReadinessGain: "Reconciliation lock possible",
    launchReadinessGain: "Treasurer sign-off path",
    humanOnly: true,
    doNot: ["auto_match_ambiguous"],
  });

  add({
    id: "rules-topics",
    title: "Complete Rules page topic reviews",
    owner: "compliance_officer",
    href: "/admin/compliance/rules",
    command: "npm run compliance:rule-resolution-report",
    impact: "high",
    urgency: "this_week",
    dependencyIds: [],
    riskReduction: `${snap.ruleReviewItems} rule_review queue items gated`,
    filingReadinessGain: "Rule gate cleared",
    launchReadinessGain: "Queue burn-down unlock",
    humanOnly: true,
    doNot: ["batch_rule_review"],
  });

  add({
    id: "addresses",
    title: "Fill missing vendor addresses from source only",
    owner: "ernie",
    href: "/admin/compliance/ernie#spreadsheet",
    command: null,
    impact: "high",
    urgency: "this_week",
    dependencyIds: ["audit-spreadsheet"],
    riskReduction: `${snap.inventory.missingAddresses} address gaps`,
    filingReadinessGain: "Vendor fields complete",
    launchReadinessGain: "Data quality score up",
    humanOnly: true,
    doNot: ["invent_addresses"],
  });

  add({
    id: "import-preview",
    title: "Run audit import preview after spreadsheet fill",
    owner: "operator",
    href: null,
    command: "npm run compliance:april-audit-import-preview",
    impact: "medium",
    urgency: "later",
    dependencyIds: ["audit-spreadsheet"],
    riskReduction: "Catches unsafe spreadsheet rows before any future import",
    filingReadinessGain: "Validates human work",
    launchReadinessGain: "Safe automation path later",
    humanOnly: false,
    doNot: ["apply_import_without_preview"],
  });

  add({
    id: "production-sync",
    title: "Verify Netlify April26 / bank import path",
    owner: "steve",
    href: "/admin/compliance/settings",
    command: "npm run compliance:deploy-readiness",
    impact: "medium",
    urgency: "later",
    dependencyIds: [],
    riskReduction: "Prod matches local rehearsal",
    filingReadinessGain: "Remote operators can work",
    launchReadinessGain: ctx.deploy.readyForNetlifyDeploy ? "Deploy OK" : "Deploy blocked",
    humanOnly: true,
    doNot: [],
  });

  while (actions.length < 25) {
    const nba = ctx.enginePkg.engine.criticalPath[actions.length - 7];
    if (!nba) break;
    add({
      id: nba.id,
      title: nba.title,
      owner: (nba.owner === "treasurer" ? "treasurer" : nba.owner === "operator" ? "operator" : "human") as CriticalPathV2["actions"][0]["owner"],
      href: nba.href,
      command: nba.command,
      impact: "medium",
      urgency: "later",
      dependencyIds: [],
      riskReduction: nba.whyCritical,
      filingReadinessGain: nba.unlocks,
      launchReadinessGain: nba.realisticProgressAfter,
      humanOnly: nba.doNotAutomate,
      doNot: UNSAFE.slice(0, 3),
    });
  }

  return { generatedAt: snap.generatedAt, commitBase: snap.commitBase, actions: actions.slice(0, 25) };
}

type WorkTask = WorkRouterPlan["queues"][string][number];

function tasksForOwner(cp: CriticalPathV2, owner: string, limit: number): WorkTask[] {
  return cp.actions
    .filter((a) => a.owner === owner)
    .slice(0, limit)
    .map((a, i) => ({
      id: `${owner}-${a.id}`,
      title: a.title,
      route: a.href ?? "/admin/compliance/command-center",
      command: a.command,
      whatToLookAt: a.riskReduction,
      whatToDecide: a.filingReadinessGain,
      whatNotToDo: a.doNot,
      doneCondition: a.launchReadinessGain,
      priority: i + 1,
    }));
}

export function buildWorkRouter(ctx: IntelligenceContext, snap: IntelligenceSnapshot, cp: CriticalPathV2): WorkRouterPlan {

  return {
    generatedAt: snap.generatedAt,
    commitBase: snap.commitBase,
    queues: {
      ernie: tasksForOwner(cp, "ernie", 8),
      treasurer: tasksForOwner(cp, "treasurer", 6),
      operator: [
        {
          id: "op-spreadsheet",
          title: "Regenerate audit spreadsheet after SOS/in-kind updates",
          route: "/admin/compliance/ernie",
          command: "npm run compliance:april-audit-spreadsheet",
          whatToLookAt: "Row counts vs inventory",
          whatToDecide: "Whether main CSV is current",
          whatNotToDo: ["commit_private_json"],
          doneCondition: "CSV reflects latest workbook",
          priority: 1,
        },
      ],
      compliance_officer: tasksForOwner(cp, "compliance_officer", 5),
      steve: tasksForOwner(cp, "steve", 4),
      engineer: [
        {
          id: "eng-intelligence",
          title: "Run intelligence package after material changes",
          route: "/admin/compliance/command-center",
          command: "npm run compliance:ai-intelligence",
          whatToLookAt: "QA and typecheck",
          whatToDecide: "Whether reports need refresh",
          whatNotToDo: ["lower_confidence_threshold"],
          doneCondition: "ai-intelligence:qa passes",
          priority: 1,
        },
      ],
      ai_assist: [
        {
          id: "ai-daily",
          title: "Refresh AI intelligence and briefs",
          route: "/admin/compliance/command-center",
          command: "npm run compliance:ai-briefs",
          whatToLookAt: "Diagnosis + memory delta",
          whatToDecide: "Next global action",
          whatNotToDo: UNSAFE.slice(0, 4),
          doneCondition: "Briefs match current commit",
          priority: 1,
        },
      ],
    },
  };
}

export function buildDataQuality(ctx: IntelligenceContext, snap: IntelligenceSnapshot): DataQualityReport {
  const inv = ctx.completionCtx.inventory;
  const domains: DataQualityReport["domains"] = [
    {
      domain: "checks",
      completeness: snap.checkWorkbench.totalChecks ? Math.round((snap.checkWorkbench.readyForSos / snap.checkWorkbench.totalChecks) * 100) : 0,
      confidence: snap.checkWorkbench.present ? "medium" : "none",
      recordCount: inv.summary.uploadedCheckCount,
      missingFieldsSummary: `${snap.checkWorkbench.missingRequired} SOS rows incomplete; ${inv.summary.unmatchedUploadedChecks} unmatched`,
      sourceEvidence: "SOS workbook + April26 images",
      humanReviewRequired: true,
      filingImpact: "blocking",
    },
    {
      domain: "ledger_expenditures",
      completeness: inv.summary.exactMatchCount ? Math.round((inv.summary.exactMatchCount / inv.summary.ledgerExpenditureCount) * 100) : 0,
      confidence: "medium",
      recordCount: inv.summary.ledgerExpenditureCount,
      missingFieldsSummary: `${inv.summary.unmatchedLedgerExpenditures} without documentation`,
      sourceEvidence: "bank-april-2026.csv",
      humanReviewRequired: true,
      filingImpact: "blocking",
    },
    {
      domain: "receipts",
      completeness: 50,
      confidence: "low",
      recordCount: snap.sources.receiptImages,
      missingFieldsSummary: "Receipt-to-expense pairing incomplete",
      sourceEvidence: "April26 receipt images",
      humanReviewRequired: true,
      filingImpact: "high",
    },
    {
      domain: "in_kind",
      completeness: snap.inKind.auctionRows ? 80 : 0,
      confidence: "medium",
      recordCount: snap.inKind.auctionRows,
      missingFieldsSummary: "Photo sign-off pending",
      sourceEvidence: "Ozark auction CSV",
      humanReviewRequired: true,
      filingImpact: "high",
    },
    {
      domain: "goodchange",
      completeness: 90,
      confidence: "high",
      recordCount: snap.sources.goodChangeRows,
      missingFieldsSummary: "Per-row approval in queue",
      sourceEvidence: "GoodChange CSV",
      humanReviewRequired: true,
      filingImpact: "medium",
    },
    {
      domain: "vendor_addresses",
      completeness: inv.summary.missingAddressCount === 0 ? 100 : Math.max(0, 100 - inv.summary.missingAddressCount * 2),
      confidence: "low",
      recordCount: inv.summary.missingAddressCount,
      missingFieldsSummary: `${inv.summary.missingAddressCount} gaps — do not invent`,
      sourceEvidence: "Vendor docs only",
      humanReviewRequired: true,
      filingImpact: "blocking",
    },
    {
      domain: "rule_topics",
      completeness: 40,
      confidence: "low",
      recordCount: snap.ruleReviewItems,
      missingFieldsSummary: "Topics need Rules page review",
      sourceEvidence: "Rule corpus",
      humanReviewRequired: true,
      filingImpact: "blocking",
    },
    {
      domain: "approval_queue",
      completeness: 10,
      confidence: "medium",
      recordCount: snap.openQueueItems,
      missingFieldsSummary: "Use focused workflows not queue alone",
      sourceEvidence: "approval-items.json",
      humanReviewRequired: true,
      filingImpact: "high",
    },
    {
      domain: "reconciliation",
      completeness: snap.reconciliation.ambiguous + snap.reconciliation.unmatchedBank === 0 ? 100 : 40,
      confidence: "medium",
      recordCount: snap.reconciliation.remainingReview,
      missingFieldsSummary: `${snap.reconciliation.ambiguous} ambiguous, ${snap.reconciliation.unmatchedBank} unmatched bank`,
      sourceEvidence: "Bank rehearsal",
      humanReviewRequired: true,
      filingImpact: "blocking",
    },
  ];
  const overallScore = Math.round(domains.reduce((s, d) => s + d.completeness, 0) / domains.length);
  return { generatedAt: snap.generatedAt, commitBase: snap.commitBase, overallScore, domains };
}

export function buildFilingPredictor(ctx: IntelligenceContext, snap: IntelligenceSnapshot): FilingPrediction {
  const blockers = ctx.filingBurnDown.blockers.map((b) => b.label);
  return {
    generatedAt: snap.generatedAt,
    commitBase: snap.commitBase,
    currentStatus: snap.filingStatus as "red",
    currentBlockers: blockers,
    toYellow: [
      "Audit spreadsheet materially complete",
      "Reconciliation exceptions documented or resolved",
      "Rule topics reviewed (campaign workflow)",
    ],
    toGreen: [
      "Treasurer sign-off recorded",
      "Production storage RLS verified",
      "Filing hard gates all pass",
      "Queue terminal states for April26 scope",
    ],
    fastestUnblockers: [
      "Ernie: SOS checks + Ozark rows",
      "Treasurer: 14 ambiguous bank matches",
      "Compliance officer: rule topic reviews",
    ],
    scenarios: [
      {
        name: "After audit spreadsheet complete",
        expectedStatus: "yellow",
        requirements: ["human_answer filled", "import preview clean"],
      },
      {
        name: "After addresses complete",
        expectedStatus: "yellow",
        requirements: ["no invented addresses", "vendor confirmed"],
      },
      {
        name: "After reconciliation locked",
        expectedStatus: "yellow",
        requirements: ["treasurer lock", "exceptions documented"],
      },
      {
        name: "After rule review cleared",
        expectedStatus: "yellow",
        requirements: ["topics reviewed", "not batch approved"],
      },
      {
        name: "After production storage ready",
        expectedStatus: "green_possible",
        requirements: ["Supabase RLS", "operator checklist"],
      },
    ],
  };
}

export function buildExceptionResolver(ctx: IntelligenceContext, snap: IntelligenceSnapshot): ExceptionResolutionPlan {
  const inv = ctx.completionCtx.inventory;
  return {
    generatedAt: snap.generatedAt,
    commitBase: snap.commitBase,
    noAutoFix: true,
    groups: [
      {
        category: "unmatched_ledger",
        count: inv.summary.unmatchedLedgerExpenditures,
        recommendation: "Find receipt/check or confirm card expense in spreadsheet",
        route: "/admin/compliance/reconciliation",
        humanOnly: true,
        sampleIds: inv.matchTable.filter((m) => m.matchKind === "unmatched_ledger").slice(0, 5).map((m) => m.ledgerExpenditureId ?? ""),
      },
      {
        category: "unmatched_checks",
        count: inv.summary.unmatchedUploadedChecks,
        recommendation: "Extract on SOS board; pair to bank or mark contribution",
        route: "/admin/compliance/checks/sos-entry",
        humanOnly: true,
        sampleIds: [],
      },
      {
        category: "missing_addresses",
        count: inv.summary.missingAddressCount,
        recommendation: "Confirm vendor; add address from source only in audit CSV",
        route: "/admin/compliance/ernie",
        humanOnly: true,
        sampleIds: inv.addressGaps.slice(0, 5).map((g) => g.payeeVendor),
      },
      {
        category: "ambiguous_bank",
        count: snap.reconciliation.ambiguous,
        recommendation: "Treasurer selects correct payout batch",
        route: "/admin/compliance/reconciliation",
        humanOnly: true,
        sampleIds: [],
      },
      {
        category: "rule_review",
        count: snap.ruleReviewItems,
        recommendation: "Topic review on Rules page then individual item review",
        route: "/admin/compliance/rules",
        humanOnly: true,
        sampleIds: ctx.ruleReview.slice(0, 3).map((i) => i.id),
      },
      {
        category: "source_update_pending",
        count: ctx.approvalItems.filter((i) => i.sourceUpdatePending).length,
        recommendation: "Complete workbench decision; verify upstream write",
        route: "/admin/compliance/approval/april-2026-compliance-review",
        humanOnly: true,
        sampleIds: [],
      },
      {
        category: "production_sync",
        count: 1,
        recommendation: "Sync April26 or document prod-only workflow",
        route: "/admin/compliance/settings",
        humanOnly: true,
        sampleIds: [],
      },
    ],
  };
}

export async function buildMemoryLedger(ctx: IntelligenceContext, snap: IntelligenceSnapshot): Promise<MemoryLedger> {
  let previous: IntelligenceSnapshot | null = null;
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "compliance", "ai", "intelligence-snapshot.json"), "utf8");
    previous = JSON.parse(raw) as IntelligenceSnapshot;
  } catch {
    previous = null;
  }

  const metrics: { key: string; cur: number; prev: (p: IntelligenceSnapshot) => number }[] = [
    { key: "openQueueItems", cur: snap.openQueueItems, prev: (p) => p.openQueueItems },
    { key: "batchEligible", cur: snap.batchEligible, prev: (p) => p.batchEligible },
    { key: "ruleReviewItems", cur: snap.ruleReviewItems, prev: (p) => p.ruleReviewItems },
    { key: "unmatchedChecks", cur: snap.inventory.unmatchedChecks, prev: (p) => p.inventory.unmatchedChecks },
    { key: "auditRows", cur: snap.auditSpreadsheet.mainRows, prev: (p) => p.auditSpreadsheet.mainRows },
    { key: "sosReady", cur: snap.checkWorkbench.readyForSos, prev: (p) => p.checkWorkbench.readyForSos },
  ];

  const deltas = metrics.map(({ key, cur, prev }) => {
    const before = previous ? prev(previous) : null;
    return {
      metric: key,
      before,
      after: cur,
      direction: before === null ? ("unchanged" as const) : before === cur ? ("unchanged" as const) : before < cur ? ("up" as const) : ("down" as const),
    };
  });

  return {
    generatedAt: snap.generatedAt,
    commitBase: snap.commitBase,
    previousCommit: previous?.commitBase ?? null,
    deltas,
    resolvedBlockers:
      previous && snap.batchEligible > previous.batchEligible ? ["batch_eligible_increased"] : [],
    newBlockers: [],
    stuckItems: snap.batchEligible === 0 ? ["batch_eligible_still_zero", "filing_still_red"] : ["filing_still_red"],
    carryForward: [
      "Complete audit spreadsheet",
      "SOS check extraction",
      "Treasurer reconciliation",
      "Rules topic review",
    ],
  };
}

export function buildBriefs(
  ctx: IntelligenceContext,
  snap: IntelligenceSnapshot,
  diagnosis: DiagnosisReport,
  cp: CriticalPathV2,
  dq: DataQualityReport,
  filing: FilingPrediction,
): IntelligenceBriefs {
  const top5 = cp.actions.slice(0, 5).map((a) => `${a.rank}. ${a.title} (${a.owner})`).join("\n");
  return {
    generatedAt: snap.generatedAt,
    commitBase: snap.commitBase,
    executive: [
      `# Executive status`,
      ``,
      `**Filing:** ${snap.filingStatus} · **Completion:** ${snap.overallPercentComplete}% · **QA:** ${snap.qaScore ?? "—"} (${snap.qaStatus})`,
      ``,
      diagnosis.summary,
      ``,
      `## Top 5 actions`,
      top5,
      ``,
      `**Do not:** batch rule_review, invent addresses, fake filing green.`,
    ].join("\n"),
    operator: [
      `# Operator — today`,
      ``,
      `Open queue: ${snap.openQueueItems} (ignore for first pass). Use Ernie workflow.`,
      ``,
      `1. Regenerate audit spreadsheet if SOS/in-kind changed`,
      `2. Run import preview after Ernie fills human_answer`,
      `3. Command center intelligence section for global next action`,
      ``,
      `Data quality overall: ${dq.overallScore}/100`,
    ].join("\n"),
    ernie: [
      `# Ernie — today`,
      ``,
      `**Start:** /admin/compliance/ernie`,
      ``,
      `- SOS checks: ${snap.checkWorkbench.readyForSos}/${snap.checkWorkbench.totalChecks} ready`,
      `- Ozark in-kind: ${snap.inKind.auctionRows} rows; ${snap.inKind.photosApproved}/3 photos approved`,
      `- Addresses: ${snap.inventory.missingAddresses} gaps in spreadsheet`,
      ``,
      `Do not use empty in-kind approval forms for 49 line items.`,
    ].join("\n"),
    treasurer: [
      `# Treasurer — today`,
      ``,
      `- ${snap.reconciliation.ambiguous} ambiguous bank credits`,
      `- ${snap.reconciliation.unmatchedBank} unmatched bank lines`,
      `- ${snap.inventory.unmatchedLedger} ledger lines need documentation`,
      ``,
      `Route: /admin/compliance/reconciliation`,
      ``,
      `Filing path: ${filing.toYellow.slice(0, 2).join("; ")}`,
    ].join("\n"),
  };
}

export async function buildIntelligencePackage(): Promise<IntelligencePackage> {
  const ctx = await gatherIntelligenceContext();
  const snapshot = buildIntelligenceSnapshot(ctx);
  const diagnosis = buildDiagnosis(ctx, snapshot);
  const criticalPathV2 = buildCriticalPathV2(ctx, snapshot);
  const workRouter = buildWorkRouter(ctx, snapshot, criticalPathV2);
  const dataQuality = buildDataQuality(ctx, snapshot);
  const filingPredictor = buildFilingPredictor(ctx, snapshot);
  const exceptionResolver = buildExceptionResolver(ctx, snapshot);
  const memory = await buildMemoryLedger(ctx, snapshot);
  const briefs = buildBriefs(ctx, snapshot, diagnosis, criticalPathV2, dataQuality, filingPredictor);
  return {
    snapshot,
    diagnosis,
    criticalPathV2,
    workRouter,
    dataQuality,
    filingPredictor,
    exceptionResolver,
    memory,
    briefs,
  };
}
