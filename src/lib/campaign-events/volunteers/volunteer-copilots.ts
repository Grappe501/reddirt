export type VolunteerCopilotDef = {
  id: string;
  title: string;
  mission: string;
  audience: string[];
  firstActions: string[];
  dashboardModules: string[];
  warnings: string[];
  escalationPath: string;
  canDo: string[];
  cannotDo: string[];
  dailyActions: string[];
};

export const VOLUNTEER_COPILOTS: VolunteerCopilotDef[] = [
  {
    id: "volunteer-copilot",
    title: "Volunteer Copilot",
    mission: "Guide individual volunteers through onboarding, training, and safe event participation.",
    audience: ["volunteer"],
    firstActions: ["Complete campaign-basics", "Set availability", "Accept one event assignment"],
    dashboardModules: ["/volunteer", "team power-of-5"],
    warnings: ["No auto-send messages", "No voter file access"],
    escalationPath: "Volunteer coordinator → field manager",
    canDo: ["View training path", "RSVP to asks", "Log Power of 5 contacts with consent"],
    cannotDo: ["Send mass email", "Approve assignments", "Match voter file without review"],
    dailyActions: ["Check next training module", "Confirm upcoming shift"],
  },
  {
    id: "intern-copilot",
    title: "Intern Copilot",
    mission: "Structured intern tasks with supervision and data-privacy guardrails.",
    audience: ["intern"],
    firstActions: ["Privacy training", "Shadow event setup", "Hot wash notes module"],
    dashboardModules: ["/admin/onboarding", "/admin/campaign-events/workbench"],
    warnings: ["PII in media — redact", "No opposition research without approval"],
    escalationPath: "Campaign manager → operator",
    canDo: ["Draft hot wash", "Research counties", "Support data entry with approval"],
    cannotDo: ["Send external email", "Publish claims without source"],
    dailyActions: ["Pick one intern progression task", "Log observations"],
  },
  {
    id: "field-manager-copilot",
    title: "Field Manager Copilot",
    mission: "County field priorities, volunteer gaps, event staffing, Power of 5.",
    audience: ["field_manager", "campaign_manager"],
    firstActions: ["Review county gaps", "Staff next 3 events", "Coach one captain prospect"],
    dashboardModules: ["/admin/volunteers", "/admin/county-intelligence", "field-ops"],
    warnings: ["Canvass/phone require trained volunteers", "No hidden bulk outreach"],
    escalationPath: "Campaign manager → candidate (strategic only)",
    canDo: ["Recommend assignments", "Approve training completion", "County brief"],
    cannotDo: ["Auto-assign without human click", "Unlock SMS without readiness"],
    dailyActions: ["Top 3 county gaps", "Event staffing warnings", "Follow-up queue"],
  },
  {
    id: "volunteer-coordinator-copilot",
    title: "Volunteer Coordinator Copilot",
    mission: "Pipeline health: recruit → train → assign → thank → retain.",
    audience: ["volunteer_coordinator"],
    firstActions: ["Open volunteer command center", "Review intake queue", "Draft welcome (no send)"],
    dashboardModules: ["/admin/volunteers", "/admin/volunteers/intake", "/admin/communications"],
    warnings: ["Consent before every send", "Signup sheet OCR needs review"],
    escalationPath: "Campaign manager",
    canDo: ["Add/edit V1 profiles", "Training paths", "Draft comms"],
    cannotDo: ["Mass text", "Auto email"],
    dailyActions: ["New signups", "Training gaps", "Retention risks"],
  },
  {
    id: "county-lead-copilot",
    title: "County Lead Copilot",
    mission: "County-specific volunteer goals aligned with countyWorkbench KPIs.",
    audience: ["county_lead"],
    firstActions: ["County intelligence panel", "Power of 5 gap", "Recruit 2 volunteers"],
    dashboardModules: ["/admin/counties", "county bridge"],
    warnings: ["Workbench data may be shell — verify before public claims"],
    escalationPath: "Field manager → CM",
    canDo: ["County segment view", "Host referrals", "Local team asks"],
    cannotDo: ["Merge ajax/county DB into RedDirt without packet"],
    dailyActions: ["County volunteer goal", "One event need", "One leader prospect"],
  },
  {
    id: "social-media-copilot",
    title: "Social Media Volunteer Copilot",
    mission: "Approved assets, sharing workflows, volunteer amplifiers.",
    audience: ["communications_lead", "volunteer"],
    firstActions: ["Social media sharing module", "Brand kit review"],
    dashboardModules: ["/admin/communications", "volunteer resources"],
    warnings: ["No unsourced opponent claims"],
    escalationPath: "Communications lead",
    canDo: ["Draft share copy", "Tag social volunteers"],
    cannotDo: ["Auto-post", "DM voters"],
    dailyActions: ["Review shareable assets", "Thank active amplifiers"],
  },
  {
    id: "communications-lead-copilot",
    title: "Communications Lead Volunteer Ops Copilot",
    mission: "Bridge volunteer comms with ECC — drafts only until approved.",
    audience: ["communications_lead"],
    firstActions: ["Communications center", "Suppression check", "Template review"],
    dashboardModules: ["/admin/communications", "email-command-center"],
    warnings: ["Three send rails — use ECC for broadcast"],
    escalationPath: "Campaign manager",
    canDo: ["Draft volunteer emails", "Segment volunteers in ECC"],
    cannotDo: ["Enable mass send without checklist"],
    dailyActions: ["Draft queue", "Suppression sync status"],
  },
  {
    id: "cm-volunteer-ops-copilot",
    title: "Campaign Manager Volunteer Ops Copilot",
    mission: "Statewide volunteer health at a glance for daily briefing.",
    audience: ["campaign_manager", "candidate"],
    firstActions: ["Volunteer intelligence panel", "Top 3 needs", "Leadership prospects"],
    dashboardModules: ["/admin/volunteers", "/admin/campaign-manager-dashboard"],
    warnings: ["Demo metrics labeled on OIS public page"],
    escalationPath: "Operator",
    canDo: ["Executive summary", "Escalate gaps"],
    cannotDo: ["Bypass human send gates"],
    dailyActions: ["Volunteer count", "County gaps", "Event staffing gaps"],
  },
];
