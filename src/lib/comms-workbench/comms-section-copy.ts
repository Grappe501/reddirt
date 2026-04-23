/**
 * Short operator-facing copy for empty states. Keep practical; no tutorial walls.
 */
export const COMMS_EMPTY = {
  noPlans: "No communication plans match these filters. Clear filters, or use “New message plan” when you are ready.",
  noDrafts: "No drafts on this plan yet. Add a base message for each channel you intend to use.",
  noVariants: "No variants yet. Add one when you need a segment or copy alternative without changing the base draft.",
  noSends: "No planned sends. Approve a draft or variant, then add a send below — sends require an approved source.",
  noMedia: "No media outreach items linked. Link from the media workbench or related flows when you pitch outlets.",
  noSource: "No workflow intake, task, event, or social item is linked. Some teams still work this plan; provenance is optional but helps operators.",
  noExecution: "No sends yet, so there is no delivery or outcome data. Queue a send from the planned sends section when ready.",
  noFailures: "No recent failed sends. Failures for this workbench are listed when providers return errors or gating blocks delivery.",
  noActivity: "No recent queue/send transitions. Activity appears when operations queue, run, or complete sends.",
  dashboardNoComms: "No communication plans or media rows yet. When you add message plans, sections below will fill in.",
  noApprovedForSend:
    "No approved draft or variant yet. Finish and approve copy in Drafts or Variants before you can attach a planned send.",
  cannotCreateSend: "Create send is disabled until at least one draft or variant is approved.",
  noQueuedToRun: "Nothing in the queue for this plan. Queue a send from a planned send row, then run execution.",
  requeueAfterFix: "After fixing the issue (recipient, channel, or approval), re-queue and run again.",
} as const;
