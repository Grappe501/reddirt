export type CampaignUserRole =
  | "candidate"
  | "campaign_manager"
  | "treasurer"
  | "compliance_lead"
  | "volunteer_coordinator"
  | "county_lead"
  | "host"
  | "public_event_requester"
  | "donor_prospect"
  | "new_admin_user"
  | "operator"
  | "ai_builder";

export type UserPersonaProfile = {
  id: CampaignUserRole;
  label: string;
  goals: string[];
  frictionPoints: string[];
  commonTasks: string[];
  likelyDashboards: string[];
  informationDensity: "low" | "medium" | "high";
  decisionAuthority: "final" | "recommend" | "execute_ops" | "read_only";
  uiTone: "warm" | "direct" | "precise" | "educational";
  nextActionStyle: "one_primary" | "short_list" | "checklist";
  doNotOverwhelmRules: string[];
  drilldownNeeds: string[];
};

export const USER_PERSONAS: Record<CampaignUserRole, UserPersonaProfile> = {
  candidate: {
    id: "candidate",
    label: "Candidate (Kelly)",
    goals: ["Approve schedule quickly", "See travel reimbursement clearly", "Trust calendar truth"],
    frictionPoints: ["Too many admin terms", "Unclear what needs signature vs FYI", "Email overload"],
    commonTasks: ["Review approval packages", "Approve/deny/hold events", "Check upcoming travel"],
    likelyDashboards: ["/admin/candidate-dashboard", "/admin/campaign-events/review"],
    informationDensity: "low",
    decisionAuthority: "final",
    uiTone: "warm",
    nextActionStyle: "one_primary",
    doNotOverwhelmRules: ["Max 3 primary actions on dashboard", "Plain language for calendar sync", "Hide CM-only queues"],
    drilldownNeeds: ["Event summary", "Travel line", "Approval package preview"],
  },
  campaign_manager: {
    id: "campaign_manager",
    label: "Campaign manager",
    goals: ["Close month readiness", "Clear intake conflicts", "Keep calendar and reimbursement accurate"],
    frictionPoints: ["Scattered routes", "Stale sync warnings", "Missing mileage/city queues"],
    commonTasks: ["Month review", "Workbench triage", "Travel report", "Calendar promotion prep"],
    likelyDashboards: ["/admin/campaign-manager-dashboard", "/admin/campaign-events/workbench"],
    informationDensity: "medium",
    decisionAuthority: "execute_ops",
    uiTone: "direct",
    nextActionStyle: "short_list",
    doNotOverwhelmRules: ["Lead with highest P0 queue", "Collapse advanced sync CLI unless expanded"],
    drilldownNeeds: ["Full fact card", "Conflict list", "Promotion readiness"],
  },
  treasurer: {
    id: "treasurer",
    label: "Treasurer",
    goals: ["Accurate reimbursement packets", "Audit trail", "No surprise totals"],
    frictionPoints: ["Tentative vs official confusion", "Missing receipts (future)"],
    commonTasks: ["Print reimbursement", "Review travel report", "Month status"],
    likelyDashboards: ["/admin/campaign-events/reimbursement", "/admin/campaign-events/travel-report"],
    informationDensity: "medium",
    decisionAuthority: "final",
    uiTone: "precise",
    nextActionStyle: "checklist",
    doNotOverwhelmRules: ["Numbers first", "No campaign narrative fluff on reimbursement page"],
    drilldownNeeds: ["Mileage source", "Approval status per row"],
  },
  compliance_lead: {
    id: "compliance_lead",
    label: "Compliance lead",
    goals: ["Filing readiness", "Document gaps", "Human-reviewed AI assists only"],
    frictionPoints: ["AI overconfidence", "Mixed campaign vs compliance routes"],
    commonTasks: ["Compliance workbench", "Receipt review", "Reconciliation"],
    likelyDashboards: ["/admin/compliance", "/admin/financial-transactions"],
    informationDensity: "high",
    decisionAuthority: "final",
    uiTone: "precise",
    nextActionStyle: "checklist",
    doNotOverwhelmRules: ["Always show human approval required", "Citations for rule claims"],
    drilldownNeeds: ["Source documents", "Audit log"],
  },
  volunteer_coordinator: {
    id: "volunteer_coordinator",
    label: "Volunteer coordinator",
    goals: ["Staff events", "Clear volunteer asks", "Avoid double booking"],
    frictionPoints: ["Incomplete host info", "Last-minute changes"],
    commonTasks: ["Event drilldown", "Calendar week view"],
    likelyDashboards: ["/admin/campaign-calendar/week", "/admin/campaign-events/workbench"],
    informationDensity: "medium",
    decisionAuthority: "recommend",
    uiTone: "warm",
    nextActionStyle: "short_list",
    doNotOverwhelmRules: ["No voter file on volunteer surfaces"],
    drilldownNeeds: ["Host contact", "Run of show (future)"],
  },
  county_lead: {
    id: "county_lead",
    label: "County lead",
    goals: ["County-specific visibility", "Local event density", "Dashboard v2 fields when ready"],
    frictionPoints: ["Statewide noise", "Unverified county stats"],
    commonTasks: ["County workbench link", "Regional dashboard"],
    likelyDashboards: ["/admin/campaign-events/workbench", "county workbench external"],
    informationDensity: "medium",
    decisionAuthority: "recommend",
    uiTone: "educational",
    nextActionStyle: "short_list",
    doNotOverwhelmRules: ["Label demo/seed data clearly"],
    drilldownNeeds: ["County label on every event"],
  },
  host: {
    id: "host",
    label: "Host",
    goals: ["Confirm event details", "Know arrival time", "Simple asks"],
    frictionPoints: ["Campaign jargon", "Too many emails"],
    commonTasks: ["Respond to host outreach (human)", "View public event page"],
    likelyDashboards: [],
    informationDensity: "low",
    decisionAuthority: "read_only",
    uiTone: "warm",
    nextActionStyle: "one_primary",
    doNotOverwhelmRules: ["No admin routes", "Host-facing copy only on public surfaces"],
    drilldownNeeds: [],
  },
  public_event_requester: {
    id: "public_event_requester",
    label: "Public event requester",
    goals: ["Submit event request", "Know status", "No PII misuse"],
    frictionPoints: ["Long forms", "Unclear review timeline"],
    commonTasks: ["Website schedule form"],
    likelyDashboards: [],
    informationDensity: "low",
    decisionAuthority: "read_only",
    uiTone: "educational",
    nextActionStyle: "one_primary",
    doNotOverwhelmRules: ["No internal queue exposure"],
    drilldownNeeds: [],
  },
  donor_prospect: {
    id: "donor_prospect",
    label: "Donor / prospect",
    goals: ["Donate", "Understand candidate", "Trust privacy"],
    frictionPoints: ["Aggressive funnels"],
    commonTasks: ["Donate page", "Meet Kelly"],
    likelyDashboards: [],
    informationDensity: "low",
    decisionAuthority: "read_only",
    uiTone: "warm",
    nextActionStyle: "one_primary",
    doNotOverwhelmRules: ["No campaign OS admin concepts"],
    drilldownNeeds: [],
  },
  new_admin_user: {
    id: "new_admin_user",
    label: "New admin user",
    goals: ["Learn where to start", "Not break production", "Find month review"],
    frictionPoints: ["Route overload", "Fear of accidental send/write"],
    commonTasks: ["CM dashboard tour", "Month readiness", "AI tools catalog"],
    likelyDashboards: ["/admin/campaign-manager-dashboard", "/admin/ai-command-center"],
    informationDensity: "low",
    decisionAuthority: "read_only",
    uiTone: "educational",
    nextActionStyle: "one_primary",
    doNotOverwhelmRules: ["Start with 1-2 links", "Highlight human gates for writes/sends"],
    drilldownNeeds: ["Glossary tooltips"],
  },
  operator: {
    id: "operator",
    label: "Steve / operator",
    goals: ["Ship sprints safely", "See blockers", "Consolidate agent layer"],
    frictionPoints: ["Duplicate systems", "Unclear prod vs dry-run"],
    commonTasks: ["AI command center", "Promotion workbench", "Build status"],
    likelyDashboards: ["/admin/ai-command-center", "/admin/campaign-events/calendar-promotion"],
    informationDensity: "high",
    decisionAuthority: "final",
    uiTone: "direct",
    nextActionStyle: "short_list",
    doNotOverwhelmRules: ["Show env gates explicitly"],
    drilldownNeeds: ["Audit logs", "Tool contracts"],
  },
  ai_builder: {
    id: "ai_builder",
    label: "AI builder / developer",
    goals: ["Extend tools safely", "Observation hooks", "No secret leakage"],
    frictionPoints: ["Catalog drift", "Cross-lane imports"],
    commonTasks: ["AI tools page", "Docs", "Dry-run scripts"],
    likelyDashboards: ["/admin/campaign-events/ai-tools", "/admin/ai-command-center"],
    informationDensity: "high",
    decisionAuthority: "execute_ops",
    uiTone: "precise",
    nextActionStyle: "checklist",
    doNotOverwhelmRules: ["Contracts required per sprint"],
    drilldownNeeds: ["Helper paths", "Test checklists"],
  },
};

export function getUserPersona(role: CampaignUserRole): UserPersonaProfile {
  return USER_PERSONAS[role];
}

export function inferRoleFromPath(pathname: string): CampaignUserRole {
  if (pathname.includes("candidate-dashboard")) return "candidate";
  if (pathname.includes("campaign-manager-dashboard")) return "campaign_manager";
  if (pathname.includes("reimbursement") || pathname.includes("travel-report")) return "treasurer";
  if (pathname.includes("compliance")) return "compliance_lead";
  if (pathname.includes("ai-command-center") || pathname.includes("ai-tools")) return "operator";
  if (pathname.includes("calendar-promotion") || pathname.includes("workbench")) return "campaign_manager";
  return "new_admin_user";
}
