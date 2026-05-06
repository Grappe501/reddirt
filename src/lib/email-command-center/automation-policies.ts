/**
 * EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0 — read-only policy registry (no workers, no sends).
 * Evaluations consume cockpit snapshot fields only unless extended later.
 */

export const AUTOMATION_POLICY_IDS = [
  "stale_queue_review",
  "draft_editorial_review",
  "send_packet_execution_preflight",
  "approved_sync_not_executed",
  "failed_sync_review",
  "unreconciled_sendgrid_events",
  "gmail_watch_expiring",
  "hosted_db_not_verified",
  "suppressions_before_send",
] as const;

export type AutomationPolicyId = (typeof AUTOMATION_POLICY_IDS)[number];

export type AutomationPolicyDefinition = {
  id: AutomationPolicyId;
  title: string;
  description: string;
  /** Read-only evaluation in this packet — no side effects. */
  evaluationMode: "read_only";
};

export const AUTOMATION_POLICIES: AutomationPolicyDefinition[] = [
  {
    id: "stale_queue_review",
    title: "Stale queue item needs review",
    description:
      "Flags when the email queue has needs-attention items or many items not updated in 7 days — operator triage only; no auto-status or send.",
    evaluationMode: "read_only",
  },
  {
    id: "draft_editorial_review",
    title: "Draft needs editorial review",
    description:
      "Shared Message Studio drafts in NEEDS_REVIEW — operators review copy before send governance; no auto-edit.",
    evaluationMode: "read_only",
  },
  {
    id: "send_packet_execution_preflight",
    title: "Send packet / execution preflight",
    description:
      "Tracked EmailSendExecution rows in DRAFT or preflight-failed, or shared drafts marked approved for send governance — run preflight from Send Execution; local-only send packets stay in Message Studio browser.",
    evaluationMode: "read_only",
  },
  {
    id: "approved_sync_not_executed",
    title: "Approved sync run not executed",
    description:
      "SendGrid Marketing Contacts sync runs in APPROVED but not yet SYNCED — operator executes upsert when gates pass; contact upsert only, not email send.",
    evaluationMode: "read_only",
  },
  {
    id: "failed_sync_review",
    title: "Failed sync run needs review",
    description: "SendGrid contact sync runs in FAILED — review safeError on SendGrid Foundation; no retry automation.",
    evaluationMode: "read_only",
  },
  {
    id: "unreconciled_sendgrid_events",
    title: "Unreconciled SendGrid events",
    description:
      "Webhook SendGridEvent rows not yet linked to EmailSendRecipient — operator batch reconcile on Analytics; no provider send.",
    evaluationMode: "read_only",
  },
  {
    id: "gmail_watch_expiring",
    title: "Gmail watch expiring",
    description:
      "users.watch registration expiring within 48h for an active staff mailbox — renew from Gmail monitor or CLI dry-run; no Gmail send.",
    evaluationMode: "read_only",
  },
  {
    id: "hosted_db_not_verified",
    title: "Hosted DB not verified",
    description:
      "Kelly-Grappe / canonical hosted Postgres import gate not verified on this stack — run migrate + contact-import gate on hosted DATABASE_URL before production imports.",
    evaluationMode: "read_only",
  },
  {
    id: "suppressions_before_send",
    title: "Suppressions need review before send",
    description:
      "SendGrid suppressions exist while ACTIVE audience definitions exist — review previews and reconciliation before any future broadcast packet.",
    evaluationMode: "read_only",
  },
];

export function getAutomationPolicyDefinition(id: string): AutomationPolicyDefinition | undefined {
  return AUTOMATION_POLICIES.find((p) => p.id === id);
}
