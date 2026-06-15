/**
 * Election Plan Public Workbench — snapshot builder.
 *
 * Usage: npm run election-plan:build
 * Output: data/election-plan/election-plan-workbench.snapshot.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ELECTION_PLAN_ARCHITECTURE } from "../src/lib/election-plan/electionPlanIndex";
import type {
  ElectionPlanCity,
  ElectionPlanCounty,
  ElectionPlanLane,
  ElectionPlanWorkbenchSnapshot,
} from "../src/lib/election-plan/types";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data/election-plan");
const OUT_FILE = path.join(OUT_DIR, "election-plan-workbench.snapshot.json");
const BRAIN_DATA = path.join(ROOT, "data/campaign-brain");

const PLAN = path.join(ROOT, "docs/strategic-plan/plurality-victory-plan");
const BRAIN = path.join(ROOT, "docs/campaign-brain");

function buildPeoplePowerSection() {
  const pp = readJson<{
    volunteerLeadership: {
      foundingTeamGoal: number;
      foundingTeamCurrent: number;
      julyRetreat: { location: string };
      monthlyCalls: { schedule: string };
    };
    mobilize: { eventsLinked: number; rsvpTotal: number };
    substack: { storiesPublished: number };
    storyWorkflow: { steps: string[] };
  }>(path.join(BRAIN_DATA, "people-power-network.json"));

  const cri = readJson<{ metrics: Record<string, number>; goals: Record<string, number> }>(
    path.join(BRAIN_DATA, "community-relationship-index.json"),
  );
  const po5 = readJson<{ statewide: { powerOf5Commitments: number } }>(path.join(BRAIN_DATA, "power-of-5.json"));
  const strike = readJson<{ counties: Array<{ roles: Record<string, { status: string; name: string }> }> }>(
    path.join(BRAIN_DATA, "county-strike-teams.json"),
  );

  const roleKeys = 9;
  let filled = 0;
  for (const c of strike?.counties ?? []) {
    for (const r of Object.values(c.roles ?? {})) {
      if (r.status === "assigned" && r.name?.trim()) filled++;
    }
  }
  const totalSlots = (strike?.counties?.length ?? 75) * roleKeys;
  const strikePct = totalSlots > 0 ? Math.round((filled / totalSlots) * 1000) / 10 : 0;

  const criLabels: Record<string, string> = {
    signs: "Signs",
    shirts: "Shirts",
    storiesPublished: "Community stories",
    churchesVisited: "Churches visited",
    volunteerGrowth: "Volunteer growth",
    powerOf5Growth: "Power of 5",
    houseParties: "House parties",
    businessesHighlighted: "Businesses highlighted",
  };

  const metrics = cri?.metrics ?? {};
  const goals = cri?.goals ?? {};
  const communityRelationshipIndex = Object.entries(criLabels).map(([k, label]) => ({
    label,
    current: metrics[k] ?? 0,
    goal: goals[k],
  }));

  return {
    foundingVolunteersGoal: pp?.volunteerLeadership.foundingTeamGoal ?? 20,
    foundingVolunteersCurrent: pp?.volunteerLeadership.foundingTeamCurrent ?? 0,
    launchLabel: "June 28 · 6 PM · Zoom",
    retreatLocation: pp?.volunteerLeadership.julyRetreat?.location ?? "Forevermost Farms",
    monthlyCalls: pp?.volunteerLeadership.monthlyCalls?.schedule ?? "Last Sunday · 6 PM",
    mobilizeEventsLinked: pp?.mobilize?.eventsLinked ?? 0,
    mobilizeRsvpTotal: pp?.mobilize?.rsvpTotal ?? 0,
    substackStoriesPublished: pp?.substack?.storiesPublished ?? 0,
    strikeTeamCoveragePct: strikePct,
    powerOf5Commitments: po5?.statewide?.powerOf5Commitments ?? 0,
    storyWorkflow: pp?.storyWorkflow?.steps ?? [
      "Campaign Brain",
      "Mobilize Event",
      "Volunteer Recruitment",
      "Event",
      "Substack Story",
      "Email",
      "Social Media",
      "Local Sharing",
      "Relationship Growth",
    ],
    communityRelationshipIndex,
    sections: [
      { id: "volunteer", title: "Volunteer Leadership", description: "Founding 20 · June 28 launch · Forevermost retreat" },
      { id: "mobilize", title: "Mobilize", description: "Events · RSVP · volunteer shifts · GOTV" },
      { id: "substack", title: "Substack", description: "County community stories" },
      { id: "postcards", title: "Postcards", description: "Visit · GOTV · faith · volunteer programs" },
      { id: "phones", title: "Phone Banks", description: "Missing D · visits · GOTV · follow-up" },
      { id: "house", title: "House Parties", description: "10 · 25 · 50 · 100 person templates" },
      { id: "po5", title: "Power of 5", description: "Trusted network scaling" },
      { id: "capital", title: "Relationship Capital", description: "Physical trust manifestations" },
      { id: "stories", title: "Community Stories", description: "Story-first event workflow" },
      { id: "strike", title: "County Strike Teams", description: "75 county deployment captains" },
    ],
  };
}

function buildMotionPresenceSection() {
  const metrics = readJson<{
    countiesVisited: number;
    countiesTotal: number;
    citiesVisited: number;
    stopsCompleted: number;
    milesTraveled: number;
    eventsAttended: number;
    storiesPublished: number;
    storiesPending: number;
    storiesShared: number;
    substackPublished: number;
    videosPublished: number;
    socialPostsPublished: number;
    localBusinessesHighlighted: number;
    churchesHighlighted: number;
    schoolsHighlighted: number;
    mediaMentions: number;
    peopleSpotlighted: number;
    contentPyramidCompletionPct: number;
    arkansasPresenceScore: number;
    septemberPersuasionReadiness: number;
  }>(path.join(BRAIN_DATA, "motion-metrics.json"));

  const resume = readJson<{
    goal: string;
    storyCategories: Array<{ id: string; label: string; count: number; goal: number }>;
  }>(path.join(BRAIN_DATA, "social-media-resume.json"));

  const archive = readJson<{
    counties: Array<{
      county: string;
      visited: boolean;
      stops: number;
      lastDate: string | null;
      daysSinceLastVisit?: number | null;
      coverageStatus?: string;
      relationshipStatus?: string;
    }>;
    stops: Array<{ county: string; city: string; date: string; event?: string; location?: string; type: string }>;
  }>(path.join(BRAIN_DATA, "county-visit-archive.json"));

  const pipeline = readJson<{
    cadence: Array<{ day: string; activity: string }>;
    workflow: string[];
  }>(path.join(BRAIN_DATA, "story-pipeline.json"));

  const m = metrics ?? {
    countiesVisited: 0,
    countiesTotal: 75,
    citiesVisited: 0,
    stopsCompleted: 0,
    milesTraveled: 0,
    eventsAttended: 0,
    storiesPublished: 0,
    storiesPending: 0,
    storiesShared: 0,
    substackPublished: 0,
    videosPublished: 0,
    socialPostsPublished: 0,
    localBusinessesHighlighted: 0,
    churchesHighlighted: 0,
    schoolsHighlighted: 0,
    mediaMentions: 0,
    peopleSpotlighted: 0,
    contentPyramidCompletionPct: 0,
    arkansasPresenceScore: 0,
    septemberPersuasionReadiness: 0,
  };

  const recentStops = [...(archive?.stops ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)
    .map((s) => ({
      county: s.county,
      city: s.city,
      date: s.date,
      location: s.event ?? s.location ?? "",
      type: s.type,
    }));

  return {
    doctrine:
      "The Arkansas Presence Strategy — visible statewide motion. When voters ask 'Has Kelly been to my area?' the answer should almost always be yes.",
    goal: resume?.goal ?? "1000 Arkansas Stories",
    arkansasPresenceScore: m.arkansasPresenceScore,
    septemberPersuasionReadiness: m.septemberPersuasionReadiness,
    countiesVisited: m.countiesVisited,
    countiesTotal: m.countiesTotal,
    citiesVisited: m.citiesVisited,
    stopsCompleted: m.stopsCompleted,
    milesTraveled: m.milesTraveled,
    eventsAttended: m.eventsAttended,
    storiesPublished: m.storiesPublished,
    storiesPending: m.storiesPending,
    storiesShared: m.storiesShared,
    substackPublished: m.substackPublished,
    videosPublished: m.videosPublished,
    socialPostsPublished: m.socialPostsPublished,
    localBusinessesHighlighted: m.localBusinessesHighlighted,
    churchesHighlighted: m.churchesHighlighted,
    schoolsHighlighted: m.schoolsHighlighted,
    mediaMentions: m.mediaMentions,
    peopleSpotlighted: m.peopleSpotlighted,
    contentPyramidCompletionPct: m.contentPyramidCompletionPct,
    storyCategories: resume?.storyCategories ?? [],
    countyMap: (archive?.counties ?? []).map((c) => ({
      county: c.county,
      visited: c.visited,
      stops: c.stops,
      lastDate: c.lastDate,
      daysSinceLastVisit: c.daysSinceLastVisit ?? null,
      coverageStatus: c.coverageStatus ?? (c.visited ? "visited" : "not_visited"),
      relationshipStatus: c.relationshipStatus ?? "none",
    })),
    recentStops,
    cadence: pipeline?.cadence ?? [],
    storyWorkflow: pipeline?.workflow ?? [
      "Campaign Brain",
      "Mobilize",
      "Event",
      "Content Capture",
      "Story Publication",
      "Email",
      "Social",
      "Community Sharing",
      "Volunteer Recruitment",
    ],
    components: [
      { id: "presence", title: "Arkansas Presence Tracker", description: "Counties · cities · stops · miles · venue types" },
      { id: "map", title: "Arkansas Presence Map", description: "75 counties · visit count · relationship status" },
      { id: "archive", title: "County Visit Archive", description: "Permanent record — photos · videos · story links" },
      { id: "pipeline", title: "Story Pipeline", description: "Visit → video → carousel → story → Substack → email" },
      { id: "categories", title: "Community Story Categories", description: "Business · teacher · veteran · faith · success/challenge" },
      { id: "resume", title: "Social Media Resume", description: "Public proof the campaign is growing" },
      { id: "inventory", title: "Content Inventory", description: "Videos · photos · Substack · press — never run dry" },
      { id: "workflow", title: "Story-First Event Workflow", description: "Brain → Mobilize → capture → publish → recruit" },
      { id: "local", title: "Local Algorithm Playbook", description: "Community pride drives discoverability" },
      { id: "readiness", title: "September Readiness", description: "Will September voters see proof Kelly was everywhere?" },
    ],
  };
}

function buildForwardMotionSection() {
  const queue = readJson<{
    stops: Array<{
      eventId: string;
      eventName: string;
      county: string;
      city: string;
      date: string;
      assignment: string;
      effectiveScore: number;
      verificationStatus: string;
      activationReadinessPct: number;
      mobilizeStatus: string;
      facebookStatus: string;
      newsReleaseStatus: string;
      graphicsStatus: string;
      phoneBankStatus: string;
      postcardStatus: string;
      storyWorkflowStatus: string;
      nextAction: string;
    }>;
  }>(path.join(BRAIN_DATA, "upcoming-stops-activation-queue.json"));

  const summary = readJson<{
    heroLine: string;
    upcomingCount: number;
    nextWeekCount: number;
    priorityWindowCount: number;
    avgActivationReadiness: number;
  }>(path.join(BRAIN_DATA, "forward-motion-summary.json"));

  const stops = queue?.stops ?? [];
  const now = new Date();
  const weekOut = new Date(now);
  weekOut.setDate(weekOut.getDate() + 7);

  const upcomingStops = stops.slice(0, 24).map((s) => ({
    eventId: s.eventId,
    eventName: s.eventName,
    county: s.county,
    city: s.city,
    date: s.date,
    assignment: s.assignment,
    effectiveScore: s.effectiveScore,
    verificationStatus: s.verificationStatus,
    activationReadinessPct: s.activationReadinessPct,
    mobilizeStatus: s.mobilizeStatus,
    facebookStatus: s.facebookStatus,
    newsReleaseStatus: s.newsReleaseStatus,
    graphicsStatus: s.graphicsStatus,
    phoneBankStatus: s.phoneBankStatus,
    postcardStatus: s.postcardStatus,
    storyWorkflowStatus: s.storyWorkflowStatus,
    nextAction: s.nextAction,
  }));

  const missingPieces: string[] = [];
  for (const s of stops.slice(0, 30)) {
    if (s.mobilizeStatus === "not_started" || s.mobilizeStatus === "draft_needed")
      missingPieces.push(`${s.eventName}: Mobilize draft`);
    if (s.facebookStatus === "not_started" || s.facebookStatus === "draft_needed")
      missingPieces.push(`${s.eventName}: Facebook draft`);
    if (s.newsReleaseStatus === "not_started" || s.newsReleaseStatus === "draft_needed")
      missingPieces.push(`${s.eventName}: News release`);
    if (s.graphicsStatus === "not_started" || s.graphicsStatus === "needed")
      missingPieces.push(`${s.eventName}: Graphics request`);
  }

  return {
    heroLine:
      summary?.heroLine ??
      "Showing where Kelly is going next is as important as proving where she has already been.",
    upcomingCount: summary?.upcomingCount ?? stops.length,
    nextWeekCount: summary?.nextWeekCount ?? 0,
    priorityWindowCount: summary?.priorityWindowCount ?? 0,
    avgActivationReadiness: summary?.avgActivationReadiness ?? 0,
    stops: upcomingStops,
    missingPieces: missingPieces.slice(0, 15),
    components: [
      { id: "queue", title: "Activation Queue", description: "Upcoming stops with full activation status" },
      { id: "weekly", title: "Weekly Packet", description: "Kelly · surrogate · county team stops next 7 days" },
      { id: "news", title: "News Releases", description: "Draft releases — approval before send" },
      { id: "graphics", title: "Social Graphics", description: "Designer briefs — no auto-generated images" },
      { id: "facebook", title: "Facebook Events", description: "Draft copy only — no API posting" },
      { id: "mobilize", title: "Mobilize Drafts", description: "RSVP goals · roles · reminders" },
      { id: "phone", title: "Phone Banks", description: "Scripts · assignments — no voter PII" },
      { id: "postcard", title: "Postcards", description: "Visit announcement · writing parties" },
      { id: "canvass", title: "Canvass / Door Hangers", description: "Future layer — defaults to future" },
      { id: "story", title: "Story Capture", description: "Pre-stop briefs → Phase 12 post-event proof" },
    ],
  };
}

function buildCoalitionPowerMapSection() {
  const s = readJson<{
    heroLine: string;
    naacp: { branchesTotal: number; called: number; meetingsRequested: number; speakingScheduled: number };
    aea: { countiesActive: number; teacherSupporters: number; meetingsCompleted: number };
    muslim: { contactsTotal: number; meetingsOpen: number; meetingsRequested: number };
    hispanic: { frameworkStatus: string; lead: string; pendingJasmineReview: boolean };
    labor: { unionsTotal: number; contacted: number; meetingsCompleted: number; endorsementsInProgress: number };
    electedOfficials: { contacted: number; total: number; meetingsCompleted: number; introductionsRequested: number };
    candidates: { activePartnerships: number; sharedEvents: number; jointMobilize: number };
    pastOfficials: { engaged: number; total: number };
    sherwood: { goal: string; vipTablesSold: number; vipTablesGoal: number; ticketsSold: number; status: string; onTrack: boolean };
    cityForums: { planned: number; booked: number; total: number; fortSmithBooked: boolean };
    ruralTownhalls: { planned: number; total: number };
  }>(path.join(BRAIN_DATA, "coalition-power-map-summary.json"));

  return {
    heroLine: s?.heroLine ?? "Move from opportunity to organized relationships.",
    naacp: s?.naacp ?? { branchesTotal: 0, called: 0, meetingsRequested: 0, speakingScheduled: 0 },
    aea: s?.aea ?? { countiesActive: 0, teacherSupporters: 0, meetingsCompleted: 0 },
    muslim: s?.muslim ?? { contactsTotal: 0, meetingsOpen: 0, meetingsRequested: 0 },
    hispanic: s?.hispanic ?? { frameworkStatus: "pending_jasmine_review", lead: "Jasmine Serano", pendingJasmineReview: true },
    labor: s?.labor ?? { unionsTotal: 0, contacted: 0, meetingsCompleted: 0, endorsementsInProgress: 0 },
    electedOfficials: s?.electedOfficials ?? { contacted: 0, total: 0, meetingsCompleted: 0, introductionsRequested: 0 },
    candidates: s?.candidates ?? { activePartnerships: 0, sharedEvents: 0, jointMobilize: 0 },
    pastOfficials: s?.pastOfficials ?? { engaged: 0, total: 0 },
    sherwood: s?.sherwood ?? { goal: "Win Sherwood 60%+", vipTablesSold: 0, vipTablesGoal: 20, ticketsSold: 0, status: "planning", onTrack: false },
    cityForums: s?.cityForums ?? { planned: 0, booked: 0, total: 20, fortSmithBooked: false },
    ruralTownhalls: s?.ruralTownhalls ?? { planned: 0, total: 10 },
    standardAskPackage: [
      "What should Kelly know about your area?",
      "Who are the 5–10 people she must meet?",
      "Who are the volunteer leaders in your area?",
      "What events should Kelly attend?",
      "Can you introduce us to local networks?",
      "Can you help us connect with email/text/social networks where appropriate?",
      "Can you help us identify financial supporters?",
      "Can you personally support the campaign financially?",
      "Can we schedule a follow-up meeting?",
      "Can we publicly or privately list you as a supporter if appropriate?",
    ],
    components: [
      { id: "naacp", title: "NAACP Branches", description: "Call every branch · Kelly speaking requests" },
      { id: "aea", title: "AEA / Teachers", description: "April Reisma · county teacher supporters" },
      { id: "muslim", title: "Muslim Outreach", description: "Dr. Ali Khan · Ebrahim network" },
      { id: "hispanic", title: "Hispanic Outreach", description: "Framework only — Jasmine Serano lead" },
      { id: "labor", title: "Labor & Unions", description: "Union halls · endorsements · Fouche · Bledsoe" },
      { id: "elected", title: "Democratic Officials", description: "Networks · money · volunteer leaders" },
      { id: "candidates", title: "Running Candidates", description: "Shared canvass · phone bank · Mobilize" },
      { id: "past", title: "Past Officials", description: "Institutional memory · introductions" },
      { id: "sherwood", title: "WIN SHERWOOD", description: "60%+ · GOTV kickoff · VIP tables" },
      { id: "forums", title: "Top 20 City Forums", description: "Sept/Oct joint candidate forums" },
      { id: "rural", title: "Rural Town Halls", description: "Election Q&A · clerk · transparency" },
    ],
  };
}

function buildEndorsementAcquisitionSection() {
  const sc = readJson<{
    heroLine: string;
    requested: number;
    meetingsScheduled: number;
    presentationsGiven: number;
    endorsed: number;
    pending: number;
    declined: number;
    activated: number;
    volunteerLeadsGenerated: number;
    donorLeadsGenerated: number;
    institutional: { labor: number; teacher: number; civilRights: number; total: number };
    currentOfficials: number;
    formerOfficials: number;
    communityLeaders: number;
    candidatePartnerships: number;
    byTier: Record<string, number>;
  }>(path.join(BRAIN_DATA, "endorsement-scorecard.json"));

  const queue = readJson<{ targets: Array<{ name: string; organization: string; tier: number; endorsementStatus: string; county: string }> }>(
    path.join(BRAIN_DATA, "endorsement-acquisition-queue.json"),
  );

  const pendingTargets = (queue?.targets ?? [])
    .filter((t) => ["requested", "meeting_scheduled", "presentation_given", "decision_pending"].includes(t.endorsementStatus))
    .slice(0, 12)
    .map((t) => ({
      name: t.name,
      organization: t.organization,
      tier: t.tier,
      status: t.endorsementStatus,
      county: t.county,
    }));

  return {
    heroLine: sc?.heroLine ?? "Endorsements are validators — measure activation, not vanity.",
    requested: sc?.requested ?? 0,
    meetingsScheduled: sc?.meetingsScheduled ?? 0,
    presentationsGiven: sc?.presentationsGiven ?? 0,
    endorsed: sc?.endorsed ?? 0,
    pending: sc?.pending ?? 0,
    declined: sc?.declined ?? 0,
    activated: sc?.activated ?? 0,
    volunteerLeadsGenerated: sc?.volunteerLeadsGenerated ?? 0,
    donorLeadsGenerated: sc?.donorLeadsGenerated ?? 0,
    institutional: sc?.institutional ?? { labor: 0, teacher: 0, civilRights: 0, total: 0 },
    currentOfficialsEndorsed: sc?.currentOfficials ?? 0,
    formerOfficialsEndorsed: sc?.formerOfficials ?? 0,
    communityLeadersEndorsed: sc?.communityLeaders ?? 0,
    candidatePartnerships: sc?.candidatePartnerships ?? 0,
    byTier: {
      tier1: sc?.byTier?.tier1 ?? 0,
      tier2: sc?.byTier?.tier2 ?? 0,
      tier3: sc?.byTier?.tier3 ?? 0,
      tier4: sc?.byTier?.tier4 ?? 0,
      tier5: sc?.byTier?.tier5 ?? 0,
    },
    valueCriteria: [
      "Credibility",
      "Volunteer activation",
      "Donor activation",
      "Network access",
      "Voter persuasion",
    ],
    activationChecklist: [
      "Announcement graphic",
      "Social media post",
      "Website placement",
      "Election-plan dashboard update",
      "Email inclusion",
      "Press release consideration",
      "Mobilize volunteer recruitment",
    ],
    pendingTargets,
    components: [
      { id: "tier1", title: "Tier 1 — Institutional", description: "Labor · teachers · civil rights · caucuses" },
      { id: "tier2", title: "Tier 2 — Current Elected", description: "Legislators · county · municipal · school board" },
      { id: "tier3", title: "Tier 3 — Former Elected", description: "Credibility · donors · community memory" },
      { id: "tier4", title: "Tier 4 — Community Influencers", description: "Pastors · civic · business · veterans" },
      { id: "tier5", title: "Tier 5 — Candidate Partnerships", description: "Shared execution · cross-endorsements" },
      { id: "union", title: "Union Strategy", description: "Fouche · Brown · Bledsoe · member comms" },
      { id: "naacp", title: "NAACP Strategy", description: "Speak at branches · endorsement pathway" },
      { id: "aea", title: "AEA Strategy", description: "April Reisma · teacher network" },
      { id: "announce", title: "Announcement System", description: "Graphic · social · email · Mobilize — activate" },
      { id: "scorecard", title: "Endorsement Scorecard", description: "Requested · received · leads · activation" },
    ],
  };
}

function buildVoterContactSection() {
  const vc = readJson<{
    heroLine: string;
    doctrine: string;
    humanContactIndex: {
      total: number;
      goal: number;
      completionPct: number;
      components: Record<string, number>;
    };
    tracks: {
      lane2Reactivation: {
        contacted: number;
        engaged: number;
        committed: number;
        turnoutTarget: number;
        completionPct: number;
      };
      lane3Registration: {
        registrationsStarted: number;
        registrationsCompleted: number;
        registrationEvents: number;
        volunteerRegistrars: number;
        goal: number;
        completionPct: number;
      };
      lane4Persuasion: {
        conversations: number;
        followUps: number;
        eventAttendance: number;
        endorsementsGenerated: number;
      };
    };
    funnel: {
      volunteersActive: number;
      voterContacts: number;
      commitments: number;
      turnoutTargets: number;
    };
    channels: Array<{
      id: string;
      label: string;
      primaryMetric: number;
      goal: number;
      completionPct: number;
      detail: string;
    }>;
  }>(path.join(BRAIN_DATA, "voter-contact-summary.json"));

  const c = vc?.humanContactIndex?.components ?? {};

  return {
    heroLine: vc?.heroLine ?? "Human Contact Index — direct Arkansans reached by the campaign.",
    doctrine:
      vc?.doctrine ??
      "Volunteer → Voter Contact → Commitment → Turnout. Lanes 2, 3, and 4 are won through conversations.",
    humanContactIndex: {
      total: vc?.humanContactIndex?.total ?? 0,
      goal: vc?.humanContactIndex?.goal ?? 250_000,
      completionPct: vc?.humanContactIndex?.completionPct ?? 0,
      components: {
        phoneCalls: c.phoneCalls ?? 0,
        postcards: c.postcards ?? 0,
        doorsKnocked: c.doorsKnocked ?? 0,
        housePartyAttendees: c.housePartyAttendees ?? 0,
        powerOf5Conversations: c.powerOf5Conversations ?? 0,
        volunteerRecruits: c.volunteerRecruits ?? 0,
        eventAttendees: c.eventAttendees ?? 0,
      },
    },
    tracks: vc?.tracks ?? {
      lane2Reactivation: { contacted: 0, engaged: 0, committed: 0, turnoutTarget: 51_051, completionPct: 0 },
      lane3Registration: {
        registrationsStarted: 0,
        registrationsCompleted: 0,
        registrationEvents: 0,
        volunteerRegistrars: 0,
        goal: 50_000,
        completionPct: 0,
      },
      lane4Persuasion: { conversations: 0, followUps: 0, eventAttendance: 0, endorsementsGenerated: 0 },
    },
    funnel: vc?.funnel ?? { volunteersActive: 0, voterContacts: 0, commitments: 0, turnoutTargets: 51_051 },
    channels: vc?.channels ?? [],
    components: [
      { id: "hci", title: "Human Contact Index", description: "Statewide heartbeat — phones + postcards + doors + events" },
      { id: "lane2", title: "Lane 2 Reactivation", description: "Missing Democrats · contacted · engaged · committed" },
      { id: "lane3", title: "Registration", description: "50K new voters · events · volunteer registrars" },
      { id: "lane4", title: "Persuasion", description: "Independents · moderate Republicans · validators" },
      { id: "phone", title: "Phone Banks", description: "Relationship · visit invite · GOTV · follow-up" },
      { id: "postcard", title: "Postcards", description: "Visit announcement · senior GOTV · youth" },
      { id: "canvass", title: "Canvass", description: "Candidate-led · shared turf · 50K door goal" },
      { id: "powerOf5", title: "Power of 5", description: "Trusted-network conversations → recruits" },
      { id: "houseParty", title: "House Parties", description: "10/25/50/100 templates · registration at host" },
      { id: "gotv", title: "GOTV", description: "Final-week turnout contacts" },
    ],
  };
}

type WeekPlanRow = {
  weekNumber: number;
  range: string;
  status: string;
  cluster: string;
  cities: string[];
  focus: string;
  clusterFocus?: string;
  counties?: string[];
  events?: string[];
  volunteerGoals?: string[];
  coalitionGoals?: string[];
  storytellingGoals?: string[];
  endorsementGoals?: string[];
  gotvGoals?: string[];
  metrics?: Array<{ label: string; target: number | string }>;
};

function buildWeekPlansSection(): WeekPlanRow[] {
  const plan = readJson<{ weeks: WeekPlanRow[] }>(path.join(OUT_DIR, "twenty-week-plan.json"));

  return plan?.weeks ?? [];
}

function buildCampaignTimeline() {
  const plan = readJson<{
    timeline: Array<{
      weekNumber: number;
      date: string;
      label: string;
      category: string;
      importance: string;
    }>;
  }>(path.join(OUT_DIR, "twenty-week-plan.json"));

  return plan?.timeline ?? [];
}

function buildWarRoomSection() {
  const fm = readJson<{ upcomingCount?: number; nextWeekCount?: number }>(
    path.join(BRAIN_DATA, "forward-motion-summary.json"),
  );
  const queue = readJson<{ stops?: Array<{ county: string }> }>(
    path.join(BRAIN_DATA, "upcoming-stops-activation-queue.json"),
  );
  const pp = readJson<{ volunteerLeadership?: { foundingTeamGoal?: number; foundingTeamCurrent?: number } }>(
    path.join(BRAIN_DATA, "people-power-network.json"),
  );
  const sherwood = readJson<{
    vipTablesSold?: number;
    vipTablesGoal?: number;
    ticketsSold?: number;
    volunteerSignups?: number;
  }>(path.join(BRAIN_DATA, "win-sherwood-operation.json"));
  const endorse = readJson<{ requested?: number; endorsed?: number }>(
    path.join(BRAIN_DATA, "endorsement-scorecard.json"),
  );
  const hci = readJson<{ total?: number; goal?: number; completionPct?: number }>(
    path.join(BRAIN_DATA, "human-contact-index.json"),
  );

  const stops = queue?.stops ?? [];
  const countiesCovered = new Set(stops.map((s) => s.county.replace(/ County$/, ""))).size;

  const topPriorities = [
    "Volunteer Leadership Launch — June 28 · 6 PM · Zoom",
    "Sherwood Event Sponsorship & VIP Table Sales",
    "NAACP Branch Outreach — first 5 branches",
    "Teacher Network Meetings — April Reisma pathway",
    "Labor Outreach Preparation — briefing packet + first calls",
  ];

  return {
    weeksRemaining: 20,
    currentWeek: 1,
    weekRange: "2026-06-15 → 2026-06-21",
    projectedVotes: 410_197,
    lane2Potential: 51_051,
    registrationGoal: 50_000,
    registrationProgress: 0,
    endorsementsRequested: endorse?.requested ?? 0,
    endorsementsEndorsed: endorse?.endorsed ?? 0,
    volunteerLeadersGoal: pp?.volunteerLeadership?.foundingTeamGoal ?? 20,
    volunteerLeadersCurrent: pp?.volunteerLeadership?.foundingTeamCurrent ?? 0,
    upcomingEvents: fm?.nextWeekCount ?? 14, // Forward Motion intelligence queue — not confirmed Kelly calendar
    countiesCovered,
    countiesTotal: 75,
    hciTotal: hci?.total ?? 0,
    hciGoal: hci?.goal ?? 250_000,
    hciCompletionPct: hci?.completionPct ?? 0,
    calendarTruthVerified: 122,
    calendarTruthGoal: 300,
    calendarTruthPct: Math.round((122 / 300) * 1000) / 10,
    phase9Ready: false,
    sherwoodGoal: "60%+",
    sherwoodVipSold: sherwood?.vipTablesSold ?? 0,
    sherwoodVipGoal: sherwood?.vipTablesGoal ?? 20,
    sherwoodTicketsSold: sherwood?.ticketsSold ?? 0,
    sherwoodVolunteers: sherwood?.volunteerSignups ?? 0,
    topPrioritiesThisWeek: topPriorities,
  };
}

function buildCandidateDashboard() {
  const war = buildWarRoomSection();
  return {
    weeksRemaining: war.weeksRemaining,
    projectedVotes: war.projectedVotes,
    lane2Potential: war.lane2Potential,
    registrationGoal: war.registrationGoal,
    countiesCovered: war.countiesCovered,
    countiesTotal: war.countiesTotal,
    upcomingStops: war.upcomingEvents,
    volunteerLeadersGoal: war.volunteerLeadersGoal,
    volunteerLeadersCurrent: war.volunteerLeadersCurrent,
    sherwoodGoal: war.sherwoodGoal,
    sherwoodVipSold: war.sherwoodVipSold,
    sherwoodVipGoal: war.sherwoodVipGoal,
    topPrioritiesThisWeek: war.topPrioritiesThisWeek,
    currentWeek: war.currentWeek,
    weekRange: war.weekRange,
  };
}

function readJson<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function countyAction(
  tier: string,
  guardrail: string,
  primary: string,
  coveragePct: number,
): string {
  if (guardrail === "violation") return `Priority visit — ${primary} · coverage ${coveragePct}%`;
  if (guardrail === "warning") return `Schedule contact — ${primary}`;
  if (tier === "A") return `Maintain Tier A cadence — ${primary}`;
  if (tier === "B") return `Relationship build — ${primary}`;
  return `Maintenance touch — verify local calendar`;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const fourLanes = readJson<{
    lanes: Record<string, { name: string; goal: number; potential?: number; stretch?: number; note: string }>;
    victoryProjection: { pluralityWinRange: { low: number; high: number }; traditionalMajorityTarget: number };
  }>(path.join(PLAN, "command-center/four-lanes-dashboard.json"));

  const dropOff = readJson<{
    totals: {
      presidential2024Dem: number;
      midterm2022Dem: number;
      rawDropOff: number;
      recovery50Total: number;
      recovery75Total: number;
    };
  }>(path.join(PLAN, "part-ii-electoral-math/chapter-04-democratic-drop-off/statewide-drop-off-summary.json"));

  const citiesData = readJson<{
    top40TargetVotes: number;
    top10TargetVotes: number;
    top10Cities: ElectionPlanCity[];
    cities: ElectionPlanCity[];
  }>(path.join(PLAN, "part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy/top-40-city-summary.json"));

  const vci = readJson<{
    counties: Array<{
      county: string;
      slug: string;
      vci: number;
      rank: number;
      mission: { role: string; primaryMission: string; secondaryMission: string };
    }>;
  }>(path.join(PLAN, "command-center/victory-contribution-index.json"));

  const opportunity = readJson<{
    counties: Array<{
      county: string;
      slug: string;
      tier: string;
      dropOffRecovery50: number;
      registrationGoal: number;
      republicanConversionPotential: number;
      rank: number;
    }>;
  }>(path.join(PLAN, "part-ii-electoral-math/opportunity-scorecard/statewide-opportunity-scorecard.json"));

  const coverage = readJson<{
    counties: Array<{
      county: string;
      tier: string;
      planned: number;
      completed: number;
      completionPct: number;
      guardrailStatus: string;
    }>;
  }>(path.join(BRAIN, "measurement/county-coverage-completion.json"));

  const scenarios = readJson<{
    pluralityRange: { low: number; high: number };
    scenarios: Record<string, { label: string; projectedVotes: number }>;
  }>(path.join(BRAIN, "scenario-engine/scenarios.json"));

  const brainHealth = readJson<{
    current: Record<string, number | string | null>;
    calendarTruthExit: Record<string, { met: boolean; current: string | number; required: string | number }>;
  }>(path.join(BRAIN, "governance/brain-health-dashboard.json"));

  const calendarTruth = readJson<{ current: Record<string, number> }>(
    path.join(BRAIN, "operations/calendar-truth-metrics.json"),
  );

  const relationship = readJson<{
    doctrine: string;
    relationshipCapitalIndex: number;
    assets: Array<{ name: string; current: number; goal: number }>;
    programs: Array<{ name: string; completed: number; scheduled: number; goal: number }>;
    channels?: string[];
  }>(path.join(BRAIN, "relational-organizing/relationship-capital.json"));

  const clusters = readJson<{
    clusters: Array<{
      id: string;
      name: string;
      counties: string[];
      recommendedVisits: number;
      combined: { victoryContributionIndex: number };
    }>;
  }>(path.join(PLAN, "command-center/opportunity-clusters/clusters.json"));

  const clusterShare = readJson<{
    clusterContribution: Array<{ name: string; vci: number; shareOfExpected: number }>;
  }>(path.join(BRAIN, "scenario-engine/scenarios.json"));

  const weekCandidates = readJson<{
    weeks: Array<{
      weekNumber: number;
      weekOf: string;
      range: { label: string };
      status: string;
      primaryCluster: { name: string; priority: string };
      focusCityPair: Array<{ name: string }>;
      topEvents: unknown[];
    }>;
  }>(path.join(BRAIN, "phase-8/week-candidates/week-candidates.json"));

  const oppByCounty = new Map(opportunity?.counties.map((c) => [c.county, c]) ?? []);
  const vciByCounty = new Map(vci?.counties.map((c) => [c.county, c]) ?? []);
  const coverageByCounty = new Map(coverage?.counties.map((c) => [c.county, c]) ?? []);

  const counties: ElectionPlanCounty[] = (vci?.counties ?? []).map((v) => {
    const o = oppByCounty.get(v.county);
    const cov = coverageByCounty.get(v.county);
    const tier = o?.tier ?? cov?.tier ?? "D";
    const completed = cov?.completed ?? 0;
    const planned = cov?.planned ?? 1;
    const pct = cov?.completionPct ?? 0;
    const guardrail = cov?.guardrailStatus ?? "unknown";
    return {
      county: v.county,
      slug: v.slug.replace(/-county$/, ""),
      tier,
      vciRank: v.rank,
      vci: v.vci,
      strategicRole: v.mission.role,
      primaryMission: v.mission.primaryMission,
      secondaryMission: v.mission.secondaryMission,
      registrationGoal: o?.registrationGoal ?? 0,
      lane2Recovery50: o?.dropOffRecovery50 ?? 0,
      gopConversionPotential: o?.republicanConversionPotential ?? 0,
      coverageCompleted: completed,
      coveragePlanned: planned,
      coveragePct: pct,
      guardrailStatus: guardrail,
      recommendedAction: countyAction(tier, guardrail, v.mission.primaryMission, pct),
      playbookPath: `docs/strategic-plan/plurality-victory-plan/part-iii-arkansas-battlefield/chapter-09-seventy-five-county-playbook/counties/${v.slug}.md`,
    };
  });

  const lanes: ElectionPlanLane[] = fourLanes
    ? [
        {
          id: "lane1",
          name: fourLanes.lanes.lane1.name,
          goal: fourLanes.lanes.lane1.goal,
          note: fourLanes.lanes.lane1.note,
        },
        {
          id: "lane2",
          name: fourLanes.lanes.lane2.name,
          goal: fourLanes.lanes.lane2.goal,
          potential: fourLanes.lanes.lane2.potential,
          stretch: fourLanes.lanes.lane2.stretch,
          note: fourLanes.lanes.lane2.note,
        },
        {
          id: "lane3",
          name: fourLanes.lanes.lane3.name,
          goal: fourLanes.lanes.lane3.goal,
          note: fourLanes.lanes.lane3.note,
        },
        {
          id: "lane4",
          name: fourLanes.lanes.lane4.name,
          goal: fourLanes.lanes.lane4.goal,
          note: fourLanes.lanes.lane4.note,
        },
      ]
    : [];

  const pluralityLow = scenarios?.pluralityRange.low ?? 390_000;
  const pluralityHigh = scenarios?.pluralityRange.high ?? 420_000;
  const expectedVotes = scenarios?.scenarios.expected.projectedVotes ?? 410_197;

  const snapshot: ElectionPlanWorkbenchSnapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    classification: "Internal campaign strategy presentation — not for public distribution.",
    hero: {
      title: "Arkansas Plurality Victory Plan",
      subtitle: "Kelly Grappe for Secretary of State",
      tagline:
        "The 20-week campaign operating plan to win a three-candidate race by building the largest coalition in Arkansas.",
      metrics: [
        { label: "Expected projection", value: fmt(expectedVotes) },
        { label: "Plurality win range", value: `${fmt(pluralityLow)}–${fmt(pluralityHigh)}` },
        { label: "Democratic drop-off pool", value: fmt(dropOff?.totals.rawDropOff ?? 102_070) },
        { label: "Lane 2 @ 50% recovery", value: fmt(dropOff?.totals.recovery50Total ?? 51_051) },
        { label: "Registration goal", value: fmt(50_000) },
        { label: "Top 40 city target", value: fmt(citiesData?.top40TargetVotes ?? 207_507) },
        {
          label: "Verified events",
          value: `${brainHealth?.current.verifiedEvents ?? 3} / 300+`,
          detail: "Calendar Truth sprint",
        },
      ],
    },
    executive: {
      summary:
        "Kelly Grappe runs a plurality strategy: recover missing Democrats, register new voters, build trust in rural Arkansas, and win a three-candidate Secretary of State race without requiring a statewide majority.",
      constraints: [
        "Campaign Brain architecture is frozen — no new strategy models.",
        "Verified reality is the limiting factor: 3 verified events vs 300+ goal.",
        "Phase 9 (Weeks 1–20 lock) remains blocked until Calendar Truth exit criteria are met.",
        "Field teams must feed verification, owners, and outcome reports every week.",
      ],
      cards: [
        { label: "Plurality win range", value: `${fmt(pluralityLow)}–${fmt(pluralityHigh)}` },
        { label: "Expected projection", value: fmt(expectedVotes) },
        { label: "Democratic drop-off pool", value: fmt(dropOff?.totals.rawDropOff ?? 102_070) },
        { label: "Lane 2 @ 50% recovery", value: fmt(dropOff?.totals.recovery50Total ?? 51_051) },
        { label: "Registration goal", value: fmt(50_000) },
        { label: "Top 40 city target", value: fmt(citiesData?.top40TargetVotes ?? 207_507) },
        { label: "Top 10 city target", value: fmt(citiesData?.top10TargetVotes ?? 131_694) },
      ],
      brainStatus: "Operational — decision intelligence, routing, and weekly brief active.",
      calendarTruthRequirement:
        "Do not lock the 20-week calendar until 300+ verified events, 75/75 county owners, and 90%+ outcome reporting.",
    },
    theoryOfVictory: {
      lanes,
      doctrine: {
        title: "Big Table Democrat Doctrine",
        pillars: [
          "Working-class politics rooted in community rebuilding and fiscal responsibility",
          "Public education as foundation of self-sufficiency and workforce development",
          "Dignity for all people — freedom of conscience without taking rights from others",
          "Nonpartisan local offices: clerks, sheriffs, judges, school boards serve people first",
          "Only American citizens vote; corporate accountability for immigration exploitation",
        ],
        tableBeliefs: [
          "Room for conservative Democrats and pro-life Democrats",
          "Room for rural, Christian, union, and small-business Democrats",
          "Room for independents who want honest government",
          "Relationships create trust · trust creates turnout · turnout creates victory",
        ],
      },
    },
    electoralMath: {
      baselineD: fourLanes?.lanes.lane1.goal ?? 325_814,
      traditionalMajorityTarget: fourLanes?.victoryProjection.traditionalMajorityTarget ?? 498_963,
      pluralityRange: { low: pluralityLow, high: pluralityHigh },
      scenarios: ["conservative", "expected", "aggressive"].map((key) => {
        const s = scenarios?.scenarios[key];
        const votes = s?.projectedVotes ?? 0;
        return {
          label: s?.label ?? key,
          projectedVotes: votes,
          inPluralityRange: votes >= pluralityLow && votes <= pluralityHigh,
        };
      }),
      dropOff: {
        presidential2024Dem: dropOff?.totals.presidential2024Dem ?? 397_420,
        midterm2022Dem: dropOff?.totals.midterm2022Dem ?? 295_350,
        rawDropOff: dropOff?.totals.rawDropOff ?? 102_070,
        recovery50: dropOff?.totals.recovery50Total ?? 51_051,
        recovery75: dropOff?.totals.recovery75Total ?? 76_563,
      },
      explanation:
        "The campaign does not need to convince Arkansas to become something it is not. The campaign needs to recover missing Democrats, register new voters, build trust in rural communities, and win a plurality in a three-candidate race.",
    },
    counties,
    cities: citiesData?.cities ?? [],
    top10TargetVotes: citiesData?.top10TargetVotes ?? 131_694,
    top40TargetVotes: citiesData?.top40TargetVotes ?? 207_507,
    campaignBrain: {
      flow: "Strategic Plan → Campaign Brain → Weekly Execution",
      modules: [
        { name: "Decision intelligence", description: "Event scoring · VCI · cluster priority", path: "docs/campaign-brain/decision-intelligence" },
        { name: "Recommendation engine", description: "Campaign Impact Score × verification confidence", path: "docs/campaign-brain/routing" },
        { name: "Kelly time model", description: "Assignment routing · surrogate deployment", path: "docs/campaign-brain/routing/local-surrogate-training.md" },
        { name: "Faith engagement index", description: "Pastor outreach · church calendar layer", path: "docs/campaign-brain/layers/faith-engagement" },
        { name: "Clerk relationship layer", description: "County clerk meetings · election integrity", path: "docs/campaign-brain/layers/clerk-relationships" },
        { name: "Scenario engine", description: "Conservative · Expected · Aggressive projections", path: "docs/campaign-brain/scenario-engine" },
        { name: "Captured opportunity", description: "Lane capture rollups by county and cluster", path: "docs/campaign-brain/measurement/captured-opportunity.json" },
        { name: "Event learning loop", description: "Predicted vs actual outcomes", path: "docs/campaign-brain/feedback-loops" },
        { name: "Weekly executive packet", description: "Monday leadership brief", path: "docs/campaign-brain/weekly-brief" },
      ],
    },
    calendarTruth: {
      verifiedEvents: calendarTruth?.current.verifiedEvents ?? 3,
      verifiedGoal: 300,
      tentativeEvents: calendarTruth?.current.tentativeEvents ?? 250,
      missingDates: calendarTruth?.current.missingDates ?? 87,
      countyFairsVerified: String(brainHealth?.calendarTruthExit.allCountyFairsVerified.current ?? "0/75"),
      tierAEventsVerified: String(brainHealth?.calendarTruthExit.tierACountyEventsVerified.current ?? "0/62"),
      countyContactOwners: String(brainHealth?.calendarTruthExit.everyCountyContactOwner.current ?? "0/75"),
      outcomeReportPct: Number(brainHealth?.current.outcomeReportPct ?? 0),
      phase9Ready: Boolean(brainHealth?.calendarTruthExit.readyToLockWeeks1to20?.met ?? false),
      warning:
        "The Campaign Brain is ready. The data supply chain is not. Do not lock the 20-week calendar until Calendar Truth exit criteria are met.",
      exitCriteria: brainHealth
        ? Object.entries(brainHealth.calendarTruthExit)
            .filter(([k]) => k !== "readyToLockWeeks1to20")
            .map(([k, v]) => ({
              label: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
              met: v.met,
              current: String(v.current),
            }))
        : [],
    },
    relationshipCapital: {
      doctrine: relationship?.doctrine ?? "Relationships create trust. Trust creates turnout. Turnout creates victory.",
      index: relationship?.relationshipCapitalIndex ?? 0,
      assets: relationship?.assets ?? [],
      programs: relationship?.programs ?? [],
      channels: [
        "Yard signs · shirts · buttons · flags",
        "House parties · civic club meetings · faith events",
        "Local businesses · Airbnbs · restaurants highlighted",
        "Substack / local media writeups",
        "Postcard teams · phone banks · canvassing",
        "Extension Homemakers · libraries · clerk offices",
        "Local sports · local vendor shirt editions",
      ],
    },
    execution: {
      lockNotice:
        "Week plans remain candidate schedules until event dates are verified and leadership approves lock.",
      clusters: (clusters?.clusters ?? []).map((c) => {
        const share = clusterShare?.clusterContribution.find((s) => s.name === c.name);
        return {
          id: c.id,
          name: c.name,
          counties: c.counties,
          vci: c.combined.victoryContributionIndex,
          shareOfExpected: share?.shareOfExpected ?? 0,
          recommendedVisits: c.recommendedVisits,
        };
      }),
      weekCandidates: (weekCandidates?.weeks ?? []).slice(0, 20).map((w) => ({
        weekNumber: w.weekNumber,
        weekOf: w.weekOf,
        rangeLabel: w.range.label,
        status: w.status,
        primaryCluster: w.primaryCluster.name,
        clusterPriority: w.primaryCluster.priority,
        focusCities: w.focusCityPair.map((c) => c.name),
        topEventCount: w.topEvents.length,
      })),
    },
    architecture: ELECTION_PLAN_ARCHITECTURE,
    peoplePower: buildPeoplePowerSection(),
    motionPresence: buildMotionPresenceSection(),
    forwardMotion: buildForwardMotionSection(),
    coalitionPowerMap: buildCoalitionPowerMapSection(),
    endorsementAcquisition: buildEndorsementAcquisitionSection(),
    voterContact: buildVoterContactSection(),
    candidateDashboard: buildCandidateDashboard(),
    warRoom: buildWarRoomSection(),
    weekPlans: buildWeekPlansSection(),
    campaignTimeline: buildCampaignTimeline(),
  };

  writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2), "utf8");
  // eslint-disable-next-line no-console
  console.log(
    `Election plan workbench snapshot: ${counties.length} counties · ${snapshot.cities.length} cities · ${OUT_FILE}`,
  );
}

main();
