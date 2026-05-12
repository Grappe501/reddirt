import { OPS_NOTIFICATION_PRIMARY_PUBLIC } from "@/config/ops-notification-public";
import type { VosMaturityLevel } from "@/lib/volunteer-ops/vos-team-maturity";
import { inferVosMaturityFromTeam } from "@/lib/volunteer-ops/vos-team-maturity";
import type { Team } from "@/types/dashboard";
import type { AutomationEmailTemplate, AutomationLane, AutomationStep } from "@/types/automation-queue";

type StepDef = {
  id: string;
  title: string;
  summary: string;
  lane: AutomationLane;
  ownerRole: string;
  dueTiming: string;
  dashboardTaskCopy: string;
  emailSubject: string;
  emailBody: string;
  completionAction: string;
};

function buildSequence(seqId: string, defs: StepDef[]): AutomationStep[] {
  return defs.map((d, i) => ({
    ...d,
    sequenceId: seqId,
    order: i + 1,
    nextStepId: defs[i + 1]?.id ?? null,
  }));
}

/** Scripted next actions per maturity — demo only; server persistence comes later. */
const MATURITY_STEP_SEQUENCES: Record<VosMaturityLevel, AutomationStep[]> = {
  1: buildSequence("vos-maturity-1", [
    {
      id: "m1-invite-triad",
      title: "Invite missing lane coordinators",
      summary: "Close the Events, Social, and Power of 5 / VR triad so weekly rhythm can start.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "This week",
      dashboardTaskCopy:
        "Send one private invite per open lane. Keep notes short and specific — people say yes faster when the ask is clear.",
      emailSubject: "Join our triad — one lane open",
      emailBody:
        "We are building a 3-person volunteer team in our community. One coordinator lane is still open — would you consider owning it with us?",
      completionAction: "triad_invites_sent",
    },
    {
      id: "m1-daily-social",
      title: "Post one approved social touch",
      summary: "Like, comment, or share campaign-approved content once today.",
      lane: "social-media",
      ownerRole: "Social coordinator",
      dueTiming: "Daily",
      dashboardTaskCopy: "Use only approved phrases and assets from the Resources tab.",
      emailSubject: "This week’s social seed",
      emailBody: "Here is one approved post you can lift locally. Add a truthful local sentence if you have one.",
      completionAction: "social_touch_logged",
    },
    {
      id: "m1-p5-names",
      title: "Draft your first Power of 5 names",
      summary: "Write five people you personally know — no mass outreach, relational follow-up only.",
      lane: "power-of-5",
      ownerRole: "P5 / VR coordinator",
      dueTiming: "This week",
      dashboardTaskCopy: "Names stay private to your team until someone chooses to volunteer.",
      emailSubject: "Power of 5 — start your list",
      emailBody: "We are mapping five relationships per coordinator. This is opt-in organizing, not spam.",
      completionAction: "p5_list_drafted",
    },
    {
      id: "m1-huddle",
      title: "Schedule a 20-minute triad huddle",
      summary: "Align on lanes, weekly rhythm, and who owns the next invite.",
      lane: "events",
      ownerRole: "Events coordinator",
      dueTiming: "Within 14 days",
      dashboardTaskCopy: "Use video or phone — goal is clarity, not a long meeting.",
      emailSubject: "Quick triad huddle",
      emailBody: "Can we do 20 minutes this week to align lanes and weekly rhythm?",
      completionAction: "huddle_scheduled",
    },
    {
      id: "m1-resources",
      title: "Skim the Action Queue training note",
      summary: "Understand why only three tasks show and how completion advances the list.",
      lane: "cross",
      ownerRole: "Any coordinator",
      dueTiming: "When you can",
      dashboardTaskCopy: "Open Training → Action Queue & daily rhythm for the short version.",
      emailSubject: "How we use the Action Queue",
      emailBody: "We keep three visible tasks so teams are not overwhelmed. Completing work surfaces the next priority.",
      completionAction: "training_skimmed",
    },
    {
      id: "m1-downstream-preview",
      title: "Name one future downstream neighborhood",
      summary: "No launch yet — just capture where expansion could go next.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "Optional this week",
      dashboardTaskCopy: "This stays internal until you are ready to recruit there.",
      emailSubject: "Future downstream geography",
      emailBody: "We are noting one neighborhood or community where a future team could form.",
      completionAction: "downstream_named",
    },
  ]),
  2: buildSequence("vos-maturity-2", [
    {
      id: "m2-huddle-run",
      title: "Run your first triad huddle",
      summary: "Decide weekly social, events, and P5 commitments for the next two weeks.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "This week",
      dashboardTaskCopy: "End with one concrete action per lane.",
      emailSubject: "Triad huddle recap",
      emailBody: "Here is what we committed to for the next two weeks by lane.",
      completionAction: "huddle_completed",
    },
    {
      id: "m2-p5-touch",
      title: "Log one relational P5 touch each",
      summary: "Each coordinator completes one respectful check-in with someone on their list.",
      lane: "power-of-5",
      ownerRole: "P5 / VR coordinator",
      dueTiming: "This week",
      dashboardTaskCopy: "Touches are consent-based — no pressure campaigns to personal contacts.",
      emailSubject: "P5 touch rhythm",
      emailBody: "We are practicing one relational touch per week per coordinator.",
      completionAction: "p5_touch_logged",
    },
    {
      id: "m2-small-gathering",
      title: "Plan one small gathering or tabling slot",
      summary: "Pick a date window and assign an Events owner for follow-through.",
      lane: "events",
      ownerRole: "Events coordinator",
      dueTiming: "Within 21 days",
      dashboardTaskCopy: "Use the Events tab pipeline once the date firms up.",
      emailSubject: "Local gathering plan",
      emailBody: "We are proposing one small gathering or tabling opportunity with date options.",
      completionAction: "gathering_planned",
    },
    {
      id: "m2-social-coverage",
      title: "Coordinate post coverage for the gathering",
      summary: "Social lead drafts one before/after post using approved assets.",
      lane: "social-media",
      ownerRole: "Social coordinator",
      dueTiming: "Around the event",
      dashboardTaskCopy: "No private attendee details in public posts.",
      emailSubject: "Social coverage plan",
      emailBody: "Here is the plan for campaign-approved posts around our local activity.",
      completionAction: "social_coverage_set",
    },
    {
      id: "m2-vr-slot",
      title: "Reserve a voter registration help slot",
      summary: "Align with county partners or campaign VR windows when available.",
      lane: "power-of-5",
      ownerRole: "P5 / VR coordinator",
      dueTiming: "Next month window",
      dashboardTaskCopy: "Confirm materials and volunteer coverage before promoting.",
      emailSubject: "VR support window",
      emailBody: "We are holding a voter registration help window — requesting materials checklist.",
      completionAction: "vr_slot_reserved",
    },
    {
      id: "m2-help-escalation",
      title: "Practice one help escalation to campaign ops",
      summary: "Use “Need help” on a task or email ops when policy is unclear.",
      lane: "cross",
      ownerRole: "Any coordinator",
      dueTiming: "Once",
      dashboardTaskCopy: `Escalations go to ${OPS_NOTIFICATION_PRIMARY_PUBLIC} — keep voter PII out of email bodies.`,
      emailSubject: "Policy question from triad",
      emailBody: "We have a policy question about local organizing — requesting guidance.",
      completionAction: "help_escalation_practiced",
    },
  ]),
  3: buildSequence("vos-maturity-3", [
    {
      id: "m3-host-event",
      title: "Host or co-host one outreach event",
      summary: "Execute the gathering you planned — capture learnings for the Events tab.",
      lane: "events",
      ownerRole: "Events coordinator",
      dueTiming: "This cycle",
      dashboardTaskCopy: "Safety and accessibility first — follow field playbook hosting guidance.",
      emailSubject: "Outreach event recap",
      emailBody: "We hosted a local outreach event — here are public-safe highlights and follow-ups.",
      completionAction: "event_hosted",
    },
    {
      id: "m3-social-rhythm",
      title: "Hold a weekly social rhythm (3 touches)",
      summary: "Three small, authentic touches across the week using approved content.",
      lane: "social-media",
      ownerRole: "Social coordinator",
      dueTiming: "Weekly",
      dashboardTaskCopy: "Quality beats volume — pair posts with local truth you can stand behind.",
      emailSubject: "Weekly social rhythm",
      emailBody: "Here is our weekly plan for approved social touches.",
      completionAction: "social_rhythm_met",
    },
    {
      id: "m3-p5-round",
      title: "Run a P5 network check-in round",
      summary: "Each coordinator updates one relationship status respectfully.",
      lane: "power-of-5",
      ownerRole: "P5 / VR coordinator",
      dueTiming: "Weekly",
      dashboardTaskCopy: "Use the Power of 5 tab to reflect status without exposing private details.",
      emailSubject: "P5 check-in round",
      emailBody: "We completed our weekly relational check-in round.",
      completionAction: "p5_round_done",
    },
    {
      id: "m3-speaking",
      title: "Add one speaking opportunity prospect",
      summary: "Civic club, faith community, or neighbor forum — note contact path only.",
      lane: "media",
      ownerRole: "Team lead",
      dueTiming: "This month",
      dashboardTaskCopy: "Speaking requests route through campaign review when materials are involved.",
      emailSubject: "Speaking prospect",
      emailBody: "We identified one local speaking opportunity to explore with campaign guidance.",
      completionAction: "speaking_prospect_added",
    },
    {
      id: "m3-media-seed",
      title: "Seed a local media follow list",
      summary: "Collect station or paper names — no pitches sent until review.",
      lane: "media",
      ownerRole: "Social coordinator",
      dueTiming: "This month",
      dashboardTaskCopy: "Keep list public sources only — no private contact dumps.",
      emailSubject: "Local media list seed",
      emailBody: "We started a public-sourced list of local outlets to engage later with approval.",
      completionAction: "media_list_seeded",
    },
    {
      id: "m3-neighbor-team",
      title: "Invite one neighbor to shadow the triad",
      summary: "Shadowing is optional — goal is transparent, low-pressure recruitment.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "When ready",
      dashboardTaskCopy: "Shadow guests should not receive voter-file style data.",
      emailSubject: "Shadow invite",
      emailBody: "We would love for you to shadow one triad huddle to see if this work fits you.",
      completionAction: "shadow_invited",
    },
  ]),
  4: buildSequence("vos-maturity-4", [
    {
      id: "m4-fundraising-hosts",
      title: "Recruit two fundraising conversation hosts",
      summary: "Small-dollar house conversations — follow review-gated scripts only.",
      lane: "fundraising",
      ownerRole: "Team lead",
      dueTiming: "This month",
      dashboardTaskCopy: "Use the Fundraising tab for Week 4 placeholders and review stages.",
      emailSubject: "Host recruitment for small-dollar conversations",
      emailBody: "We are recruiting two trusted hosts for small-group fundraising conversations.",
      completionAction: "fundraising_hosts_recruited",
    },
    {
      id: "m4-media-template",
      title: "Run one media pitch template dry-run",
      summary: "Internal practice only — no send until campaign review.",
      lane: "media",
      ownerRole: "Social coordinator",
      dueTiming: "This month",
      dashboardTaskCopy: "Paste draft into internal review — not a live send in this pass.",
      emailSubject: "Media pitch dry-run",
      emailBody: "Attached is a draft pitch for internal review — not for publication.",
      completionAction: "media_dry_run",
    },
    {
      id: "m4-downstream",
      title: "Place one volunteer into a downstream team",
      summary: "Use placement fit checks — downstream teams inherit the same safety rules.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "This quarter",
      dashboardTaskCopy: "Use P5 placement workflow when the person is ready to lead locally.",
      emailSubject: "Downstream placement plan",
      emailBody: "We identified a volunteer ready to explore downstream team formation.",
      completionAction: "downstream_placement",
    },
    {
      id: "m4-district-stop",
      title: "Coordinate one district-style stop request",
      summary: "Log request details on Events — campaign confirms logistics.",
      lane: "events",
      ownerRole: "Events coordinator",
      dueTiming: "Planning window",
      dashboardTaskCopy: "Use the Events tab to log the request; campaign confirms logistics and materials.",
      emailSubject: "District stop coordination",
      emailBody: "We are requesting coordination support for a district-style visibility stop.",
      completionAction: "district_stop_logged",
    },
    {
      id: "m4-donor-thanks",
      title: "Draft donor thank-you chain (template)",
      summary: "Use fundraising resource library drafts — internal review only.",
      lane: "fundraising",
      ownerRole: "Team lead",
      dueTiming: "After first conversations",
      dashboardTaskCopy: "Thank-you drafts stay in preview until Script 7 sending.",
      emailSubject: "Donor thank-you draft",
      emailBody: "Draft thank-you language for internal review — not sent automatically.",
      completionAction: "donor_thanks_drafted",
    },
    {
      id: "m4-leadership-debrief",
      title: "Run a leadership debrief on expansion",
      summary: "What worked, what to stop, what help is needed from campaign HQ.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "Monthly",
      dashboardTaskCopy: "Surface blockers early — ops inbox is for coordination, not voter data.",
      emailSubject: "Expansion debrief",
      emailBody: "Here is our monthly debrief on expansion and help needed from HQ.",
      completionAction: "debrief_completed",
    },
  ]),
  5: buildSequence("vos-maturity-5", [
    {
      id: "m5-gotv-captain",
      title: "Assign GOTV coverage captains",
      summary: "Map precinct or neighborhood coverage with two backups per zone.",
      lane: "gotv",
      ownerRole: "Team lead",
      dueTiming: "Pre-window",
      dashboardTaskCopy: "Use public geography labels only in shared dashboards.",
      emailSubject: "GOTV coverage map draft",
      emailBody: "We drafted coverage captains and backup leads for GOTV operations.",
      completionAction: "gotv_captains_assigned",
    },
    {
      id: "m5-phone-bank",
      title: "Stand up a phone bank rehearsal shift",
      summary: "Dry-run scripts, handoffs, and escalation paths before live windows.",
      lane: "gotv",
      ownerRole: "Events coordinator",
      dueTiming: "Pre-window",
      dashboardTaskCopy: "Scripts must be campaign-approved before any live dial window.",
      emailSubject: "Phone bank rehearsal",
      emailBody: "We scheduled an internal rehearsal for phone bank operations.",
      completionAction: "phone_bank_rehearsal",
    },
    {
      id: "m5-canvass",
      title: "Canvass launch rehearsal",
      summary: "Pair new canvassers with experienced leads — safety and materials check.",
      lane: "gotv",
      ownerRole: "Team lead",
      dueTiming: "Pre-window",
      dashboardTaskCopy: "No voter PII in Discord or public channels — use secure ops paths only.",
      emailSubject: "Canvass rehearsal plan",
      emailBody: "We completed canvass launch rehearsal planning with materials checklist.",
      completionAction: "canvass_rehearsal",
    },
    {
      id: "m5-postcard",
      title: "Postcard team handoff packet",
      summary: "Confirm writers, addresses workflow, and postage budget placeholders.",
      lane: "gotv",
      ownerRole: "P5 / VR coordinator",
      dueTiming: "Window planning",
      dashboardTaskCopy: "Confirm writers and workflow with campaign ops before scaling postage.",
      emailSubject: "Postcard team packet",
      emailBody: "We prepared a postcard team handoff summary for internal review.",
      completionAction: "postcard_packet",
    },
    {
      id: "m5-leadership-brief",
      title: "Weekly leadership brief to downstream leads",
      summary: "One-page priorities — cadence, help, and escalation contacts.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "Weekly (GOTV)",
      dashboardTaskCopy: "Link to team dashboards — never paste sensitive lists into email.",
      emailSubject: "Weekly downstream brief",
      emailBody: "Here is the one-page leadership brief for downstream team leads.",
      completionAction: "leadership_brief_sent",
    },
    {
      id: "m5-kpi-rollup",
      title: "Roll up KPI snapshot for campaign HQ",
      summary: "Use Metrics tab numbers — flag gaps honestly.",
      lane: "cross",
      ownerRole: "Team lead",
      dueTiming: "Weekly (GOTV)",
      dashboardTaskCopy: "KPIs may be demo-seeded until live rollup lands.",
      emailSubject: "Weekly KPI rollup",
      emailBody: "Attached is our weekly KPI rollup for campaign coordination.",
      completionAction: "kpi_rollup",
    },
  ]),
};

export function getActionStepsForMaturity(level: VosMaturityLevel): AutomationStep[] {
  return MATURITY_STEP_SEQUENCES[level];
}

/** Three-slot queue + hidden upcoming steps; slots may be null when the scripted list is exhausted (preview). */
export type TeamActionQueueView = {
  teamId: string;
  neededNow: AutomationStep | null;
  comingUp: AutomationStep | null;
  nextAfterThat: AutomationStep | null;
  hiddenFutureSteps: AutomationStep[];
  maturityLevel: VosMaturityLevel;
};

export function buildTeamActionQueueView(team: Team, completedStepIds: Set<string>): TeamActionQueueView {
  const maturityLevel = inferVosMaturityFromTeam(team);
  const ordered = getActionStepsForMaturity(maturityLevel);
  const remaining = ordered.filter((s) => !completedStepIds.has(s.id));
  return {
    teamId: team.id,
    neededNow: remaining[0] ?? null,
    comingUp: remaining[1] ?? null,
    nextAfterThat: remaining[2] ?? null,
    hiddenFutureSteps: remaining.slice(3, 5),
    maturityLevel,
  };
}

export type CampaignUpdateDraft = {
  subject: string;
  body: string;
  mailtoHref: string;
};

export function buildCampaignUpdateDraft(input: {
  teamName: string;
  completedTaskTitle: string;
  completedLane: string;
  nextTaskTitle: string | null;
  teamNotes: string;
  dashboardUrl: string;
}): CampaignUpdateDraft {
  const subject = `${input.teamName} completed: ${input.completedTaskTitle}`;
  const body = [
    `Team: ${input.teamName}`,
    `Lane: ${input.completedLane}`,
    `Completed task: ${input.completedTaskTitle}`,
    `Next task: ${input.nextTaskTitle ?? "(queue caught up for this preview)"}`,
    `Notes: ${input.teamNotes || "(none)"}`,
    `Dashboard: ${input.dashboardUrl}`,
    "",
    "— Sent from volunteer dashboard preview (Script 6). Human review before external send.",
  ].join("\n");
  const mailtoHref = `mailto:${encodeURIComponent(OPS_NOTIFICATION_PRIMARY_PUBLIC)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { subject, body, mailtoHref };
}

export function buildHelpMailto(taskTitle: string): string {
  const subject = `Need help: ${taskTitle}`;
  const body =
    "We need help with the task above. What we tried:\n\nWhat we need from campaign ops:\n\n(Reminder: do not include voter PII in this email.)";
  return `mailto:${encodeURIComponent(OPS_NOTIFICATION_PRIMARY_PUBLIC)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildStepCampaignMailto(step: AutomationStep): string {
  return `mailto:${encodeURIComponent(OPS_NOTIFICATION_PRIMARY_PUBLIC)}?subject=${encodeURIComponent(step.emailSubject)}&body=${encodeURIComponent(step.emailBody)}`;
}

const laneLabel: Record<AutomationLane, string> = {
  events: "Events",
  "social-media": "Social media",
  "power-of-5": "Power of 5 / VR",
  cross: "Cross-triad",
  fundraising: "Fundraising",
  media: "Media / speaking",
  gotv: "GOTV",
};

export function formatLane(lane: AutomationLane): string {
  return laneLabel[lane] ?? lane;
}

export const AUTOMATION_EMAIL_TEMPLATES: AutomationEmailTemplate[] = [
  {
    id: "tpl-welcome-dashboard",
    title: "Welcome to your team dashboard",
    audience: "New coordinators",
    lane: "cross",
    subject: "Welcome — your team dashboard is live",
    previewText: "Three lanes, one rhythm — start with the Action Queue.",
    body: "Your dashboard keeps priorities visible. Start with the three-card Action Queue, then open your lane tab.",
    ctaLabel: "Open dashboard",
    ctaTarget: "/volunteer",
    reviewStatus: "draft",
  },
  {
    id: "tpl-invite-missing-role",
    title: "Invite missing role",
    audience: "Team leads",
    lane: "cross",
    subject: "One lane still open on our triad",
    previewText: "Private invite — specific lane, clear weekly ask.",
    body: "We still need a volunteer to own one coordinator lane. Can we send you a short lane description?",
    ctaLabel: "Lane descriptions",
    ctaTarget: "/field-playbook/structure/fractal-overview",
    reviewStatus: "draft",
  },
  {
    id: "tpl-complete-p5",
    title: "Complete your Power of 5",
    audience: "P5 / VR coordinators",
    lane: "power-of-5",
    subject: "Power of 5 — gentle weekly rhythm",
    previewText: "Five relationships, respectful follow-up.",
    body: "This week, pick one person on your list for a respectful check-in. Log the touch when complete.",
    ctaLabel: "P5 coordinator guide",
    ctaTarget: "/field-playbook/roles/power-of-five-coordinator",
    reviewStatus: "draft",
  },
  {
    id: "tpl-schedule-outreach",
    title: "Schedule outreach event",
    audience: "Events coordinators",
    lane: "events",
    subject: "Local outreach event — save the date options",
    previewText: "Small gathering or tabling — safety first.",
    body: "We are planning a small outreach moment. Here are two date options and a short agenda.",
    ctaLabel: "Events hosting playbook",
    ctaTarget: "/field-playbook/roles/events-hosting-playbook",
    reviewStatus: "draft",
  },
  {
    id: "tpl-weekly-report",
    title: "Weekly report reminder",
    audience: "Team leads",
    lane: "cross",
    subject: "Weekly snapshot for the triad",
    previewText: "Honest numbers beat hero weeks.",
    body: "Quick snapshot: social touches, event progress, P5 touches, help needed from HQ.",
    ctaLabel: "Metrics tab",
    ctaTarget: "/dashboard/field",
    reviewStatus: "draft",
  },
  {
    id: "tpl-gotv-task",
    title: "GOTV task",
    audience: "GOTV leads",
    lane: "gotv",
    subject: "GOTV window — coverage check",
    previewText: "Captains, backups, materials.",
    body: "Confirm coverage captains, rehearsal shifts, and escalation paths before live windows.",
    ctaLabel: "Field playbook",
    ctaTarget: "/field-playbook",
    reviewStatus: "draft",
  },
  {
    id: "tpl-fundraising-lead",
    title: "Fundraising lead recruitment",
    audience: "Expansion teams",
    lane: "fundraising",
    subject: "Small-dollar conversation hosts",
    previewText: "Review-gated scripts only.",
    body: "We are recruiting trusted hosts for small-group fundraising conversations — internal review before invites.",
    ctaLabel: "Fundraising resources",
    ctaTarget: "/volunteer/resources",
    reviewStatus: "draft",
  },
  {
    id: "tpl-postcard-team",
    title: "Postcard team",
    audience: "GOTV volunteers",
    lane: "gotv",
    subject: "Postcard team — writers and packets",
    previewText: "Workflow and postage placeholders.",
    body: "Outline writers, packet workflow, and postage plan — confirm with campaign ops before scale.",
    ctaLabel: "Resources",
    ctaTarget: "/volunteer/resources",
    reviewStatus: "draft",
  },
  {
    id: "tpl-phone-bank",
    title: "Phone bank",
    audience: "GOTV volunteers",
    lane: "gotv",
    subject: "Phone bank rehearsal",
    previewText: "Scripts approved before live dial.",
    body: "Internal rehearsal for scripts, handoffs, and escalation — no live dial until approval.",
    ctaLabel: "Training",
    ctaTarget: "/volunteer",
    reviewStatus: "draft",
  },
  {
    id: "tpl-canvassing",
    title: "Canvassing",
    audience: "Field volunteers",
    lane: "gotv",
    subject: "Canvass launch checklist",
    previewText: "Pair rookies with experienced leads.",
    body: "Materials, safety, and buddy pairs — confirm before neighborhood launches.",
    ctaTarget: "/field-playbook",
    ctaLabel: "Field playbook",
    reviewStatus: "draft",
  },
  {
    id: "tpl-discord-invite",
    title: "Discord invite",
    audience: "All volunteers",
    lane: "multi",
    subject: "Join the volunteer Discord (optional)",
    previewText: "Day-to-day connection — dashboard stays authoritative for tasks.",
    body: "Discord is encouraged for day-to-day connection. Bot routing comes later. Never post voter PII in Discord.",
    ctaLabel: "Volunteer onboarding",
    ctaTarget: "/volunteer",
    reviewStatus: "draft",
  },
  {
    id: "tpl-completion-update",
    title: "Completion update to campaign",
    audience: "Team leads",
    lane: "cross",
    subject: "[Team] completed: [Task]",
    previewText: "Ops notification draft — human review required.",
    body: "Use the dashboard preview to generate a draft to ops — not an automatic send in Script 6.",
    ctaLabel: "Ops inbox (mailto preview)",
    ctaTarget: `mailto:${OPS_NOTIFICATION_PRIMARY_PUBLIC}`,
    reviewStatus: "draft",
  },
];
