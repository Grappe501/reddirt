import type { ComplianceBrainSnapshot } from "../brain/compliance-brain-types";
import type { ComplianceCoach } from "./compliance-expert-types";

function coach(partial: Omit<ComplianceCoach, "generatedAt">, generatedAt: string): ComplianceCoach {
  return { generatedAt, ...partial };
}

export function buildOperatorCoach(snapshot: ComplianceBrainSnapshot): ComplianceCoach {
  const start = snapshot.queue.startOrder[0] ?? "rule_review";
  return coach(
    {
      coachId: "operator",
      title: "Operator daily workflow",
      summary: `Work the April queue (${snapshot.queue.openItems} open). Start with ${start.replace(/_/g, " ")} items, then near-eligible confidence fixes. Never batch rule_review.`,
      steps: [
        {
          step: 1,
          title: "Open command center",
          why: "See launch status and the single next action without reading every metric.",
          href: "/admin/compliance/command-center",
          humanRequired: false,
        },
        {
          step: 2,
          title: "Check April26 sources",
          why: snapshot.source.bankCsv === "missing" ? "Bank CSV is missing — reconciliation cannot complete." : "Confirm bank rehearsal counts before matching.",
          href: "/admin/compliance/april26",
          command: "npm run compliance:bank:qa",
          humanRequired: true,
        },
        {
          step: 3,
          title: "Review next best item",
          why: "Workbench orders high-leverage items so you do not pick randomly from 133 rows.",
          href: "/admin/compliance/approval/april-2026-compliance-review",
          humanRequired: true,
        },
        {
          step: 4,
          title: "Export burn-down v2",
          why: "Redacted export groups blockers without donor names.",
          command: "npm run compliance:operator-review-export-v2",
          humanRequired: false,
        },
        {
          step: 5,
          title: "Check batch readiness",
          why: `Batch eligible is ${snapshot.queue.batchEligible} — expect zero until confidence ≥98% and no rule_review.`,
          href: "/admin/compliance/approval/batch",
          humanRequired: true,
        },
      ],
      doNot: ["Batch approve rule_review", "Approve without initials", "Skip override when blockers present"],
      successCriteria: "Open queue trending down; source_update_pending cleared; no silent approvals.",
    },
    snapshot.generatedAt,
  );
}

export function buildFilingCoach(snapshot: ComplianceBrainSnapshot): ComplianceCoach {
  return coach(
    {
      coachId: "filing",
      title: "Filing readiness coach",
      summary: `Filing is ${snapshot.filing.overall} with ${snapshot.filing.blockerCount} blocker(s). Green only when every hard gate is source-backed — not when QA script passes alone.`,
      steps: snapshot.filing.blockers.slice(0, 6).map((b, i) => ({
        step: i + 1,
        title: b.label,
        why: b.greenCondition,
        href: b.href,
        humanRequired: true,
      })),
      doNot: ["Export filing package while red", "Mark filing green without treasurer review", "Ignore rule coverage gaps"],
      successCriteria: "Filing page overall green + compliance officer sign-off (not legal certification).",
    },
    snapshot.generatedAt,
  );
}

export function buildRuleCoach(snapshot: ComplianceBrainSnapshot): ComplianceCoach {
  return coach(
    {
      coachId: "rule",
      title: "Arkansas rule review coach",
      summary: `${snapshot.rules.unverifiedTopicCount} rule topics need human review on the Rules page. ${snapshot.rules.ruleReviewQueueItems} queue items are rule_review type — guarded from batch.`,
      steps: [
        {
          step: 1,
          title: "Generate rule topic packet",
          why: "Machine-readable list of topics and counts without donor PII.",
          command: "npm run compliance:rule-topic-packet",
          humanRequired: false,
        },
        {
          step: 2,
          title: "Review each topic on Rules page",
          why: "Official sources must be reviewed for campaign workflow — not legal certification.",
          href: "/admin/compliance/rules",
          humanRequired: true,
        },
        {
          step: 3,
          title: "Handle rule_review queue items",
          why: "Approve only with override documenting which topic was reviewed.",
          href: "/admin/compliance/approval/april-2026-compliance-review",
          humanRequired: true,
        },
      ],
      doNot: ["Batch approve rule_review", "Claim Arkansas legal certainty without cited sources", "Skip Rules page and override everything"],
      successCriteria: "unverifiedTopicCount → 0; rule_review items resolved with documented review.",
    },
    snapshot.generatedAt,
  );
}

export function buildReconciliationCoach(snapshot: ComplianceBrainSnapshot): ComplianceCoach {
  const bankMissing = snapshot.source.bankCsv === "missing";
  return coach(
    {
      coachId: "reconciliation",
      title: "Bank reconciliation coach",
      summary: bankMissing
        ? "Add bank CSV first — rehearsal cannot run with real unmatched/ambiguous reports until the file exists."
        : `Rehearsal ready: ${snapshot.reconciliation.readyForRehearsal}. High-confidence: ${snapshot.reconciliation.highConfidenceMatches}; unmatched bank: ${snapshot.reconciliation.unmatchedBank}.`,
      steps: bankMissing
        ? [
            {
              step: 1,
              title: "Add bank-april-2026.csv",
              why: "Treasurer export with date, amount, memo (credits positive).",
              href: "/admin/compliance/april26",
              humanRequired: true,
            },
            { step: 2, title: "Run bank QA", why: "Validates schema and duplicates.", command: "npm run compliance:bank:qa", humanRequired: false },
          ]
        : [
            {
              step: 1,
              title: "Review rehearsal on April26 desk",
              why: "See high-confidence, ambiguous, and unmatched lists before locking.",
              href: "/admin/compliance/april26",
              humanRequired: true,
            },
            {
              step: 2,
              title: "Open reconciliation workbench",
              why: "Lock matches and document ambiguous decisions.",
              href: "/admin/compliance/reconciliation",
              humanRequired: true,
            },
            { step: 3, title: "Run reconciliation QA", why: "Regression on match actions.", command: "npm run compliance:qa-reconciliation", humanRequired: false },
          ],
      doNot: ["Invent bank rows", "Auto-lock all ambiguous matches", "Skip unmatched payout review"],
      successCriteria: "Unmatched bank and payouts empty or explicitly accepted with operator notes.",
    },
    snapshot.generatedAt,
  );
}
