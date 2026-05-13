/** Volunteer Operating System (VOS) — typed models; Phase 1 = team dashboard + magic links (later). */

export type VolunteerRole = "social-media" | "events" | "power-of-5" | "general" | "not-sure";

export type TeamLevel = "county" | "city" | "precinct" | "neighborhood" | "community";

export type VolunteerOpsLifecycleStatus = "building" | "active" | "expanding" | "dormant" | "archived";

/** Synthetic id for “campaign admin” in privacy visibility lists (mock + future RBAC). */
export const VOS_CAMPAIGN_ADMIN_MEMBER_ID = "vos-campaign-admin";

export type TeamBuildInviteStatus = "drafted" | "sent" | "accepted" | "declined" | "expired" | "canceled";

/** Core triad lanes only (invitation target). */
export type TeamInviteCoreRole = Extract<VolunteerRole, "events" | "social-media" | "power-of-5">;

export type TeamBuildInvitation = {
  id: string;
  teamId: string;
  email: string;
  intendedRole: TeamInviteCoreRole;
  invitedByMemberId: string;
  status: TeamBuildInviteStatus;
  note?: string;
  createdAt: string;
  respondedAt?: string;
  /** Members (volunteer ids) + campaign admin id who may view this row; see `invitation-privacy.ts`. */
  visibleToMemberIds: string[];
};

export type TaskCadence = "daily" | "weekly" | "monthly";

/** `universal` = all roles */
export type TaskRoleScope = VolunteerRole[] | "universal";

export type Task = {
  id: string;
  title: string;
  description?: string;
  cadence: TaskCadence;
  roleApplicability: TaskRoleScope;
  completed?: boolean;
};

export type KpiPeriod = "daily" | "weekly" | "monthly" | "rolling";

export type Kpi = {
  id: string;
  label: string;
  value: number;
  target?: number;
  period: KpiPeriod;
};

export type StreakBucket = {
  currentDays: number;
  best7: number;
  best30: number;
};

export type Volunteer = {
  id: string;
  name: string;
  role: VolunteerRole;
  /** Primary team in Phase 1; multiple for future multi-team volunteers */
  teamId: string;
  assignedTeamIds: string[];
  streaks: {
    dailySocialEngagement: StreakBucket;
  };
  weeklyTaskCompletionPercent: number;
  monthlyGoalsCompleted: number;
  monthlyGoalsTarget: number;
  kpis: Kpi[];
};

export type TeamMemberEmailStatus = "confirmed" | "pending";

export type TeamMember = {
  volunteerId: string;
  name: string;
  role: VolunteerRole;
  emailStatus?: TeamMemberEmailStatus;
  lastActivity?: string;
};

export type PowerOfFiveSummary = {
  contactsTracked: number;
  touchesCompleted: number;
  registrationsCompleted: number;
  volunteersReferred: number;
};

export type P5SupportStatus = "unknown" | "supportive" | "persuadable" | "needs-follow-up" | "not-interested";

export type P5RegistrationStatus = "unknown" | "registered" | "needs-registration" | "helped-register";

export type P5VolunteerInterest = "not-asked" | "interested" | "referred-to-volunteer" | "joined-team";

/** Reach-style relational row for the Team Dashboard P5/VR lane (mock-first). */
export type TeamReachContact = {
  id: string;
  /** Public-safe label; not voter-file PII in committed mocks. */
  displayName: string;
  relationship: string;
  supportStatus: P5SupportStatus;
  registrationStatus: P5RegistrationStatus;
  lastTouch: string;
  nextAction: string;
  volunteerInterest: P5VolunteerInterest;
  /** Which triad member owns this contact in the demo */
  ownerMemberId: string;
};

/** One operating member’s Power of 5 slice (mock + future DB hydration). */
export type TeamPowerOfFiveMemberNetwork = {
  memberId: string;
  memberName: string;
  role: VolunteerRole;
  contacts: TeamReachContact[];
  touchesCompleted: number;
  registrationsCompleted: number;
  volunteerReferrals: number;
  contactsTarget: number;
  registrationsTarget: number;
};

export type TeamPowerOfFivePlacementNextStep =
  | "add-to-p5-network"
  | "place-downstream"
  | "invite-to-volunteer"
  | "invite-outreach-social-hour"
  | "invite-vr-event"
  | "consider-downstream-team";

export type P5PlacementFitCheckStatus = "pending" | "sent" | "approved" | "declined" | "not-applicable";

export type P5PlacementInviteLinkStatus = "none" | "pending-lead" | "ready-to-send" | "sent";

/** Row-level workflow for mock UI (Step 7 outcomes). */
export type P5PlacementWorkflowStatus = "pending-fit-check" | "invite-sent" | "placed" | "deferred";

/** Mock-first queue for routing new interest into P5 vs triad vs events (future workflow). */
export type TeamPowerOfFivePlacementLead = {
  id: string;
  name: string;
  location: string;
  interest: string;
  /** How they entered (e.g. form, event) + relationship context when known */
  source: string;
  suggestedOwnerMemberId: string;
  suggestedNextStep: TeamPowerOfFivePlacementNextStep;
  /** @deprecated Use workflowStatus; kept for legacy mock rows during transition */
  status?: "new" | "contacted" | "placed" | "deferred";
  /** Downstream triad name / geography target */
  suggestedDownstreamTeamName?: string;
  suggestedDownstreamTeamSlug?: string;
  suggestedDownstreamLeadName?: string;
  fitCheckStatus?: P5PlacementFitCheckStatus;
  inviteLinkStatus?: P5PlacementInviteLinkStatus;
  notes?: string;
  workflowStatus?: P5PlacementWorkflowStatus;
};

export type TeamMonthlyProgram = {
  id: string;
  title: string;
  cadence: string;
  kind: string;
  planningNote?: string;
};

export type TeamEventItem = {
  id: string;
  title: string;
  date: string;
  location?: string;
};

export type TeamPipelineItem = {
  id: string;
  title: string;
  status: string;
  notes?: string;
};

/** Kelly visit planner row (Events tab). */
export type TeamVisitPlanItem = {
  id: string;
  label: string;
  status: string;
};

export type YouthCampusKind = "high-school" | "college" | "university" | "trade-school" | "community-college";

export type YouthCampusLifecycleStatus =
  | "not-started"
  | "lead-identified"
  | "team-building"
  | "active-team"
  | "expanding"
  | "gotv-ready";

/** One row in campus mapping / Youth Outreach dashboard */
export type YouthCampusMappingRow = {
  id: string;
  name: string;
  kind: YouthCampusKind;
  status: YouthCampusLifecycleStatus;
  studentOrganizations?: string;
  /** Public-safe label only — not authenticated PII */
  leadDisplayLabel?: string;
  leadTrack?: "high-school" | "college" | "campus-team";
  registrationNotes?: string;
  /** School + callsign + number triad name for scoreboard culture (demo / manual entry). */
  studentTeamDisplayName?: string;
};

export type YouthCountyClerkVisitStatus =
  | "clerk-not-started"
  | "clerk-contacted"
  | "clerk-visit-requested"
  | "clerk-scheduled"
  | "clerk-completed"
  | "clerk-follow-up";

export type YouthCountyClerkVisitRow = {
  id: string;
  countySeatLabel: string;
  status: YouthCountyClerkVisitStatus;
  notes?: string;
};

export type YouthOutreachChallenge = {
  id: string;
  title: string;
  detail?: string;
};

export type YouthScoreboardMetric = {
  id: string;
  label: string;
  value: number;
  target?: number;
};

export type YouthGamificationBadge = {
  id: string;
  label: string;
  description?: string;
  earned: boolean;
};

export type YouthTwentySquareMetric = {
  id: string;
  label: string;
  /** 0–100 */
  percent: number;
};

/**
 * Youth Outreach — formal sub-lane under P5/VR across VOS (state → campus).
 * Hydrated from mocks or `buildYouthOutreachWorkspace` for DB-backed teams.
 */
export type TeamYouthOutreachWorkspace = {
  p5VrLaneLabel: string;
  campuses: YouthCampusMappingRow[];
  geographicKpis: Kpi[];
  campusTargetKpis: { label: string; value: string }[];
  leadResponsibilities: string[];
  highSchoolFocus: string[];
  highSchoolTasks: string[];
  collegeFocus: string[];
  collegeTasks: string[];
  monthlyRhythm: string[];
  socialRecruitmentTasks: string[];
  messagingThemes: string[];
  studentTeamRule: string;
  taskFraming: string[];
  placementNotes: string[];
  /** Cross-campus expansion doctrine and tasks */
  crossCampusDoctrine: string;
  crossCampusCollegeNetworks: string[];
  crossCampusHighSchoolNetworks: string[];
  weeklyCrossCampusTask: string;
  schoolTeamNamingFormat: string;
  schoolTeamNamingExamples: string[];
  creativeStudentEventExamples: string[];
  kellyStudentVisitGuidance: string[];
  kellyVisitRequestBullets: string[];
  cityStudentCoordination: string[];
  immersionWeeklyTarget: string;
  immersionTypicalStructure: string;
  immersionDayOne: string[];
  immersionDayTwo: string[];
  countyClerkIntro: string;
  countyClerkVisits: YouthCountyClerkVisitRow[];
  challenges: YouthOutreachChallenge[];
  scoreboardMetrics: YouthScoreboardMetric[];
  recognitionLevels: string[];
  recognitionLevelCurrent: string;
  badges: YouthGamificationBadge[];
  twentySquareYouthMetrics: YouthTwentySquareMetric[];
};

export type Team = {
  id: string;
  /** Short code e.g. LIB-104 */
  teamCode: string;
  /** Campaign-themed display e.g. Creek County Liberty 104 */
  displayName: string;
  /** URL segment e.g. creek-county-liberty-104 */
  slug: string;
  /** Future magic-link allowlist / audit (no real addresses in committed mocks) */
  accessEmails: string[];
  /** Optional AR county registry slug from `VolunteerOpsTeam.metadataJson.countySlug` (authoritative when set). */
  linkedCountySlug?: string;
  geography: string;
  level: TeamLevel;
  upstreamContactId: string;
  upstreamContactName: string;
  upstreamContactEmail?: string;
  members: TeamMember[];
  downstreamTeamIds: string[];
  kpis: Kpi[];
  weeklyBriefing: string;
  upcomingEvents: TeamEventItem[];
  eventPipeline: TeamPipelineItem[];
  visitPlans: TeamVisitPlanItem[];
  /** Present for database-backed triad teams */
  lifecycleStatus?: VolunteerOpsLifecycleStatus;
  isDatabaseBacked?: boolean;
  adminMemberIds?: string[];
  powerOfFiveSummary?: PowerOfFiveSummary;
  /** Private team build invites (mock + mapped from DB). Filter with `filterInvitationsForViewer`. */
  invitations?: TeamBuildInvitation[];
  /** Reach-style contacts for P5/VR tab (mock seed). */
  reachContacts?: TeamReachContact[];
  /** Team-level P5/VR targets for UI (mock). */
  powerOfFiveTeamTargets?: {
    minCoreContacts: number;
    minRegistrations: number;
    monthlySocialHourPlanned: boolean;
    monthlyVrEventPlanned: boolean;
  };
  /** Monthly Power of 5 / VR cadence programs (seed from metadata until Events integration is live). */
  monthlyPrograms?: TeamMonthlyProgram[];
  /** Per-member P5 networks; if absent, derived in UI from `reachContacts` + `members` + `powerOfFiveSummary`. */
  powerOfFiveMemberNetworks?: TeamPowerOfFiveMemberNetwork[];
  /** Triad placement queue (mock). */
  powerOfFivePlacementLeads?: TeamPowerOfFivePlacementLead[];
  /** Future: canonical URL for joining this team (placeholder in mocks). */
  teamInviteUrl?: string;
  /** Future: hosted QR asset for team join (placeholder in mocks). */
  teamQrCodeUrl?: string;
  /**
   * Youth Outreach (P5/VR sub-lane): campus mapping, student triads, KPIs — hydrated in team workspace.
   */
  youthOutreach?: TeamYouthOutreachWorkspace;
  /** Self-building field OS: hydrated in `getTeamWorkspaceBundle` (computed from team state + statewide mock). */
  fieldOperatingSystem?: TeamFieldOperatingSystem;
};

/** Traffic-light team health for volunteer self-governance (computed, not punitive). */
export type TeamHealthLevel = "green" | "yellow" | "red";

export type GotvReadinessBand = "not-started" | "building" | "on-track" | "gotv-ready";

export type GotvReadinessCategory = {
  id: string;
  label: string;
  /** 0–100 */
  score: number;
  detail: string;
};

export type TeamGotvReadiness = {
  band: GotvReadinessBand;
  bandLabel: string;
  categories: GotvReadinessCategory[];
  compositeScore: number;
};

export type TeamExpansionLadderOrder = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type TeamExpansionLadderStage = {
  order: TeamExpansionLadderOrder;
  title: string;
  requirements: string;
  /** 0–100 */
  progressPercent: number;
  nextAction: string;
  isComplete: boolean;
};

export type TeamDashboardBriefingExtended = {
  narrative: string;
  weekFocus: string;
  prioritySocialPost: string;
  priorityEventNeed: string;
  priorityP5VrAsk: string;
  trainingResourceOfWeek: string;
  trainingResourceHref: string;
  questionsForUpstream: string[];
};

export type StatewideVolunteerGoalsSnapshot = {
  countyTeamsLaunched: { current: number; target: number };
  cityTeamsLaunched: { current: number; target: number };
  precinctTeamsLaunched: { current: number; target: number };
  neighborhoodTeamsLaunched: { current: number; target: number };
  totalVolunteersOnboarded: { current: number; target: number };
  totalPowerOfFiveContacts: { current: number; target: number };
  totalNewRegistrations: { current: number; target: number };
  totalDownstreamTeams: { current: number; target: number };
  gotvReadyTeams: { current: number; target: number };
};

export type TeamStatewideContribution = {
  lines: string[];
};

export type TeamGovernanceChecklistItem = {
  id: string;
  label: string;
};

export type TeamFieldHealthSignal = { ok: boolean; label: string };

export type TeamFieldHealth = {
  level: TeamHealthLevel;
  headline: string;
  signals: TeamFieldHealthSignal[];
};

export type TeamFieldOperatingSystem = {
  expansionLadder: TeamExpansionLadderStage[];
  /** First stage not yet complete, or 8 if all complete. */
  currentFocusOrder: TeamExpansionLadderOrder;
  gotvReadiness: TeamGotvReadiness;
  health: TeamFieldHealth;
  statewideGoals: StatewideVolunteerGoalsSnapshot;
  statewideContribution: TeamStatewideContribution;
  briefing: TeamDashboardBriefingExtended;
  governanceWeekly: TeamGovernanceChecklistItem[];
  governanceMonthly: TeamGovernanceChecklistItem[];
  downstreamTrainingChecklist: TeamGovernanceChecklistItem[];
};

/** Recursive tree for downstream visualization */
export type DownstreamTeamNode = {
  teamId: string;
  slug: string;
  displayName: string;
  level: TeamLevel;
  geography: string;
  status: "active" | "forming" | "paused";
  leadNames: string[];
  activitySummary: string;
  children: DownstreamTeamNode[];
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: "normal" | "high";
  createdAt: string;
};

export type PriorityAction = {
  id: string;
  label: string;
  href?: string;
  dueLabel?: string;
};

export type TeamMessage = {
  id: string;
  fromName: string;
  preview: string;
  createdAt: string;
};

export type SharedFile = {
  id: string;
  name: string;
  href: string;
};

export type CampaignAlert = {
  id: string;
  label: string;
  severity: "info" | "warning";
};
