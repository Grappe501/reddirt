import type { ComplianceUxAudit } from "./compliance-expert-types";

export function buildComplianceUxAudit(): ComplianceUxAudit {
  return {
    generatedAt: new Date().toISOString(),
    globalThemes: [
      "Lead with plain-English status before metrics",
      "One primary action per page",
      "Hide technical JSON paths behind expandable details",
      "Use consistent red/yellow/green language",
      "Command center as home base — reduce nav overwhelm",
    ],
    routes: [
      {
        route: "/admin/compliance/command-center",
        headlineIdeal: "Your compliance mission control",
        primaryAction: "Do the next recommended action",
        confusionPoints: ["Too many metrics at once without hierarchy", "Unclear difference between launch % and filing red"],
        improvements: ["Hero status + why not ready + single CTA", "Progress by area bars", "Coach card"],
        priority: "high",
      },
      {
        route: "/admin/compliance/approval",
        headlineIdeal: "Review records before they count toward filing",
        primaryAction: "Open April queue",
        confusionPoints: ["Wizard vs approval choice", "Rebuild queues button scary"],
        improvements: ["Operator checklist at top", "Link to command center"],
        priority: "high",
      },
      {
        route: "/admin/compliance/april26",
        headlineIdeal: "April 2026 sources on disk",
        primaryAction: "Fix bank CSV if missing",
        confusionPoints: ["Rehearsal vs readiness terminology"],
        improvements: ["What this means panel for rehearsal", "Clear missing-file path"],
        priority: "high",
      },
      {
        route: "/admin/compliance/approval/april-2026-compliance-review",
        headlineIdeal: "April 2026 review queue",
        primaryAction: "Review next best item",
        confusionPoints: ["Filter overload", "Burn-down vs table"],
        improvements: ["Where to start list", "Collapse advanced filters"],
        priority: "high",
      },
      {
        route: "/admin/compliance/approval/batch",
        headlineIdeal: "Batch approval (safe items only)",
        primaryAction: "Understand why zero eligible",
        confusionPoints: ["Users expect batch to work now"],
        improvements: ["Plain English on 98% gate", "Near-eligible list prominent"],
        priority: "medium",
      },
      {
        route: "/admin/compliance/filing-readiness",
        headlineIdeal: "Can we file this period?",
        primaryAction: "Fix top filing blocker",
        confusionPoints: ["Red but QA passes", "Legal vs system green"],
        improvements: ["What this means for filing", "Blocker cards with green condition"],
        priority: "high",
      },
      {
        route: "/admin/compliance/approval/[queueId]/item/[itemId]",
        headlineIdeal: "Review this record",
        primaryAction: "Approve, needs info, or reject",
        confusionPoints: ["Override reason", "sourceUpdatePending", "rule_review panel"],
        improvements: ["What happens when you approve panel", "Step order: evidence → fields → decision"],
        priority: "high",
      },
    ],
  };
}
