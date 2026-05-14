export type AutomationRecommendation = {
  id: string;
  createdAt: string;
  source: "event_success_playbook" | "staff_manual" | "gotv_capacity";
  eventId?: string;
  county?: string;
  title: string;
  channel: "email" | "sms" | "phone_bank" | "task_only";
  audienceType: "event_hosts" | "confirmed_volunteers" | "opted_in_supporters" | "staff" | "county_leads";
  timing: "one_week_before" | "72_hours_before" | "day_before" | "day_of" | "after_event";
  purpose: string;
  complianceStatus: "requires_opt_in" | "safe_task_only" | "needs_review";
  status: "suggested" | "approved" | "edited" | "rejected";
  complianceGates: {
    requiresOptIn: boolean;
    unsubscribeOrStopSupport: boolean;
    sourceOfConsentKnown: boolean;
    humanApproved: boolean;
    suppressionListChecked: boolean;
    owner?: "staff" | "county_host" | "volunteer_lead" | "press" | "candidate";
  };
  humanApprovalRequired: true;
};
