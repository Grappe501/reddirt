import type { ResolvedLeaderLink, VolunteerLeader, VolunteerTeamLaneId } from "@/lib/volunteers/types";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";

export type LaneDrillDownItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  kind: "checklist" | "link" | "report";
  priority: "high" | "medium" | "low";
};

export type LaneDrillDownSection = {
  id: string;
  title: string;
  intro: string;
  items: LaneDrillDownItem[];
};

export type LaneDrillDownPage = {
  laneId: VolunteerTeamLaneId;
  label: string;
  tagline: string;
  workCompletion: LaneDrillDownSection;
  organizing: LaneDrillDownSection;
  reporting: LaneDrillDownSection;
  tools: LaneDrillDownSection;
};

function laneLabel(id: VolunteerTeamLaneId): string {
  return VOLUNTEER_TEAM_LANES.find((l) => l.id === id)?.label ?? id;
}

function primaryCountyLink(links: ResolvedLeaderLink[]): ResolvedLeaderLink | undefined {
  return links.find((l) => l.kind === "county") ?? links[0];
}

function primaryCityLink(links: ResolvedLeaderLink[]): ResolvedLeaderLink | undefined {
  return links.find((l) => l.kind === "city");
}

function workbenchHref(links: ResolvedLeaderLink[]): string | undefined {
  return primaryCityLink(links)?.href ?? primaryCountyLink(links)?.href;
}

function workbenchBasePath(slug: string, isSelf: boolean): string {
  return isSelf ? "/election-plan/operators/leaders/me" : `/election-plan/operators/leaders/${slug}`;
}

const BASE: Record<VolunteerTeamLaneId, Omit<LaneDrillDownPage, "laneId">> = {
  county: {
    label: "County",
    tagline: "Own the county playbook, workbench leadership, and weekly field reporting for your geography.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "Finish these before Sunday check-in — each ties to a live Election Plan surface.",
      items: [
        {
          id: "county-playbook",
          title: "Review county playbook priorities",
          description: "Open your county drill-down and bookmark the top three moves for this week.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "leadership-slots",
          title: "Fill open community workbench leadership slots",
          description: "Assign names to unfilled roles in your connected workbenches.",
          href: "#leadership-gaps",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "my-five",
          title: "Map remaining My Five slots",
          description: "Five trusted contacts — foundation for Power of 5 growth.",
          href: "#power-of-5",
          kind: "checklist",
          priority: "high",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "Coordinate people and places.",
      items: [
        {
          id: "community-wb",
          title: "Community workbench",
          description: "Leadership, relationships, events, and field log for your county or city.",
          kind: "link",
          priority: "high",
        },
        {
          id: "po5-team",
          title: "Power of 5 roster",
          description: "Add branch contacts under each My Five person.",
          href: "#power-of-5",
          kind: "link",
          priority: "medium",
        },
        {
          id: "message-hub",
          title: "County message hub",
          description: "Shareable conversation prompts for your county.",
          href: "/messages",
          kind: "link",
          priority: "medium",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "Log what you did — zeros are honest until records exist.",
      items: [
        {
          id: "field-log",
          title: "Log field results",
          description: "Conversations, volunteers, leaders — tagged with your operator initials.",
          kind: "report",
          priority: "high",
        },
        {
          id: "kpi-strip",
          title: "Review KPI strip",
          description: "Field entries, leadership fills, relationships, calendar.",
          href: "#kpi",
          kind: "report",
          priority: "medium",
        },
        {
          id: "command-heatmap",
          title: "Command coverage",
          description: "Activity across all field leaders.",
          href: "/election-plan/operators/leaders/command",
          kind: "report",
          priority: "low",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "Training and campaign-wide resources.",
      items: [
        {
          id: "leader-dashboard",
          title: "Leader dashboard",
          description: "Live My Five, follow-ups, and team health — production view tied to your slug.",
          href: "/election-plan/operators/leader-dashboard",
          kind: "link",
          priority: "high",
        },
        {
          id: "po5-walkthrough",
          title: "Power of 5 walkthrough",
          description: "Relational organizing structure.",
          href: "/onboarding/power-of-5",
          kind: "link",
          priority: "high",
        },
        {
          id: "ep-search",
          title: "Election Plan search",
          description: "Deep search across counties, cities, and workbenches.",
          href: "/election-plan/search",
          kind: "link",
          priority: "medium",
        },
      ],
    },
  },
  events: {
    label: "Events",
    tagline: "Plan, execute, and follow up on local events — roles, attendance, and relational next steps.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "Event lane checklist.",
      items: [
        {
          id: "next-event",
          title: "Confirm next event on calendar",
          description: "Planned or confirmed; roles assigned where possible.",
          href: "#calendar",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "event-roles",
          title: "Fill event role assignments",
          description: "Host, photography, fundraising liaison, follow-up captain.",
          href: "#events-embed",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "post-event",
          title: "Post-event follow-ups within 48 hours",
          description: "Log conversations and new volunteers after every event.",
          kind: "checklist",
          priority: "high",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "Event command and cross-lane coordination.",
      items: [
        {
          id: "event-wb",
          title: "Event workbench",
          description: "Run-of-show, assignments, and status.",
          kind: "link",
          priority: "high",
        },
        {
          id: "calendar",
          title: "Workbench calendar",
          description: "Upcoming events in your geography.",
          href: "#calendar",
          kind: "link",
          priority: "medium",
        },
        {
          id: "comms-liaison",
          title: "Coordinate with comms lane",
          description: "Social, photos, and message alignment.",
          href: "/election-plan/operators/comms-command",
          kind: "link",
          priority: "medium",
        },
        {
          id: "events-command",
          title: "Events & Mobilize command",
          href: "/election-plan/operators/events-command",
          description: "Statewide stops, Mobilize gaps, and promotion readiness.",
          kind: "link",
          priority: "high",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "Attendance and relational outcomes.",
      items: [
        {
          id: "attendance-log",
          title: "Log attendance & new contacts",
          description: "Field log: conversation, volunteer, house_party.",
          kind: "report",
          priority: "high",
        },
        {
          id: "event-kpi",
          title: "Event assignment fill rate",
          description: "Roles filled vs open on event embed.",
          href: "#events-embed",
          kind: "report",
          priority: "medium",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "",
      items: [
        {
          id: "community-hub",
          title: "Community workbench hub",
          description: "All program and city workbenches.",
          href: "/election-plan/workbenches",
          kind: "link",
          priority: "medium",
        },
      ],
    },
  },
  fundraising: {
    label: "Fundraising",
    tagline: "Grassroots asks, ride-alongs, thank-yous, and donor stewardship.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "Relational fundraising — not cold lists.",
      items: [
        {
          id: "ask-list",
          title: "Three warm ask conversations this week",
          description: "People who already trust you.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "thank-yous",
          title: "Clear thank-yous within 48 hours",
          description: "Every gift or pledge gets a personal touch.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "ride-along",
          title: "One ride-along or house meeting on calendar",
          href: "#calendar",
          description: "Pair with validator when scheduled.",
          kind: "checklist",
          priority: "medium",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "Relational pipeline for grassroots revenue.",
      items: [
        {
          id: "po5-donors",
          title: "Donor prospects in My Five branches",
          href: "#power-of-5",
          description: "Who could host or give at house-party level?",
          kind: "link",
          priority: "high",
        },
        {
          id: "team-roster",
          title: "Fundraising deputies on team roster",
          href: "#team-roster",
          description: "Co-leads for follow-up and stewardship.",
          kind: "link",
          priority: "medium",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "Log conversations — finance reconciles gifts separately.",
      items: [
        {
          id: "conversation-log",
          title: "Log fundraising conversations",
          description: "Field log: conversation — no dollar amounts in public log.",
          kind: "report",
          priority: "high",
        },
        {
          id: "weekly-touch",
          title: "Weekly touch count",
          href: "#activity",
          description: "Operator-tagged field entries.",
          kind: "report",
          priority: "medium",
        },
        {
          id: "grassroots-settlement",
          title: "Grassroots settlement (internal)",
          href: "/election-plan/operators/grassroots-fundraising-settlement",
          description: "Commission registry and GoodChange attribution — finance only.",
          kind: "report",
          priority: "low",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "",
      items: [
        {
          id: "donate",
          title: "Public donate page",
          description: "Share after trust is built.",
          href: "/donate",
          kind: "link",
          priority: "medium",
        },
      ],
    },
  },
  comms: {
    label: "Comms",
    tagline: "Local message distribution and narrative alignment with the statewide hub.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "Comms lane weekly rhythm.",
      items: [
        {
          id: "message-packet",
          title: "Pull county message packet",
          href: "/messages",
          description: "Core line + shareable prompts.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "local-posts",
          title: "One local validator story",
          description: "Neighbor, faith leader, or business — sourced only.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "event-comms",
          title: "Align with events lane on next event comms",
          description: "Copy and photos ready 72h before event.",
          kind: "checklist",
          priority: "medium",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "",
      items: [
        {
          id: "messages-hub",
          title: "Conversations & Stories hub",
          href: "/messages",
          description: "County narratives and shareable content.",
          kind: "link",
          priority: "high",
        },
        {
          id: "statewide-comms",
          title: "Statewide comms command",
          href: "/election-plan/operators/comms-command",
          description: "Editorial queue, event alignment, and county comms coverage.",
          kind: "link",
          priority: "high",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "",
      items: [
        {
          id: "conversation-reach",
          title: "Log offline conversations from posts",
          description: "Field log: conversation category.",
          kind: "report",
          priority: "high",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "",
      items: [
        {
          id: "debate-prep",
          title: "Debate prep workbench",
          href: "/election-plan/debate-prep",
          description: "Kelly pathway materials when assigned.",
          kind: "link",
          priority: "medium",
        },
      ],
    },
  },
  campus: {
    label: "Campus / youth",
    tagline: "Campus networks, youth outreach, and registration bridges.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "",
      items: [
        {
          id: "campus-map",
          title: "Map student leaders and faculty allies",
          href: "#power-of-5",
          description: "Add to My Five or team roster.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "registration-bridge",
          title: "Connect campus to registration goal",
          description: "Tabling + Help 10 + follow-up.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "next-campus-touch",
          title: "Next campus touch on calendar",
          href: "#calendar",
          description: "Planned or confirmed workbench event.",
          kind: "checklist",
          priority: "medium",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "",
      items: [
        {
          id: "campus-wb",
          title: "Campus program workbench",
          description: "Assigned campus hub.",
          kind: "link",
          priority: "high",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "",
      items: [
        {
          id: "campus-field",
          title: "Log campus conversations & signups",
          description: "Field log: volunteer and conversation.",
          kind: "report",
          priority: "high",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "",
      items: [
        {
          id: "voter-reg-lane",
          title: "Voter registration lane drill-down",
          description: "Cross-lane checklist for drives.",
          kind: "link",
          priority: "medium",
        },
      ],
    },
  },
  coalition: {
    label: "Coalition",
    tagline: "Faith, labor, NAACP, Muslim community, union, and civic partners.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "Trust before asks.",
      items: [
        {
          id: "validator-list",
          title: "Update validator / partner list",
          description: "Workbench relationships + field log.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "intro-chain",
          title: "One warm introduction this week",
          description: "Bridge partners who should know each other.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "escalation",
          title: "Escalate blocked asks to command",
          href: "/election-plan/operators/leaders/command",
          description: "When a partner needs Kelly or HQ.",
          kind: "checklist",
          priority: "medium",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "",
      items: [
        {
          id: "coalition-cmd",
          title: "Coalition command",
          href: "/election-plan/operators/coalition-command",
          description: "Statewide coalition workbench rollup and partner intake.",
          kind: "link",
          priority: "high",
        },
        {
          id: "coalition-hub",
          title: "Coalition workbench hub",
          href: "/election-plan/workbenches?kind=coalition",
          description: "All twelve coalition community workbenches.",
          kind: "link",
          priority: "high",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "",
      items: [
        {
          id: "partner-touch",
          title: "Log partner meetings",
          description: "Field log: leader and conversation.",
          kind: "report",
          priority: "high",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "",
      items: [
        {
          id: "immersion",
          title: "Immersion missions hub",
          href: "/election-plan/immersion-missions",
          description: "Listening and relationship missions.",
          kind: "link",
          priority: "medium",
        },
      ],
    },
  },
  "voter-registration": {
    label: "Voter registration",
    tagline: "Registration drives, Help 10, deadlines, and drop-off locations.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "",
      items: [
        {
          id: "drive-date",
          title: "Confirm next registration drive",
          href: "#calendar",
          description: "On workbench calendar.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "help-10",
          title: "Help 10 participation plan",
          description: "Ten conversations leading to registration checks.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "drop-off",
          title: "Verify county drop-off locations",
          description: "County playbook + clerk resources.",
          kind: "checklist",
          priority: "medium",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "",
      items: [
        {
          id: "county-reg",
          title: "County playbook — registration",
          description: "Deadlines and clerk coordination.",
          kind: "link",
          priority: "high",
        },
        {
          id: "statewide-vr",
          title: "Statewide VR command",
          href: "/election-plan/operators/voter-registration",
          description: "Registration intake, drives, Help 10 rollups, and county goals.",
          kind: "link",
          priority: "high",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "",
      items: [
        {
          id: "reg-log",
          title: "Log registrations & conversations",
          description: "Field log quantity for signups.",
          kind: "report",
          priority: "high",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "",
      items: [],
    },
  },
  operations: {
    label: "Operations / vol HQ",
    tagline: "Volunteer HQ, intake, cross-lane coordination, and field entry hygiene.",
    workCompletion: {
      id: "work",
      title: "Work completion",
      intro: "",
      items: [
        {
          id: "operator-sync",
          title: "Operator identity synced",
          href: "#field-log",
          description: "Initials in operator table after sign-in.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "field-current",
          title: "Field log current within 7 days",
          href: "#field-log",
          description: "At least one result weekly when active.",
          kind: "checklist",
          priority: "high",
        },
        {
          id: "cross-lane",
          title: "Clear one cross-lane blocker",
          description: "Intro, resource, or HQ escalation.",
          kind: "checklist",
          priority: "medium",
        },
      ],
    },
    organizing: {
      id: "organizing",
      title: "Organizing",
      intro: "",
      items: [
        {
          id: "operators-hub",
          title: "Operators hub",
          href: "/election-plan/operators",
          description: "All leader workbenches.",
          kind: "link",
          priority: "high",
        },
        {
          id: "volunteer-intake",
          title: "Volunteer intake & activation",
          href: "/election-plan/operators/volunteer-intake",
          description: "Website sign-up review → placement → workbench unlock.",
          kind: "link",
          priority: "high",
        },
        {
          id: "vr-command",
          title: "Voter registration command",
          href: "/election-plan/operators/voter-registration",
          description: "Registration intake, drives, Help 10 rollups, and county goals.",
          kind: "link",
          priority: "high",
        },
        {
          id: "field-operators",
          title: "Field operators admin",
          href: "/election-plan/operators/field",
          description: "Initials whitelist.",
          kind: "link",
          priority: "medium",
        },
      ],
    },
    reporting: {
      id: "reporting",
      title: "Reporting",
      intro: "",
      items: [
        {
          id: "lane-coverage",
          title: "Lane coverage boards",
          href: "/election-plan/operators/lane-coverage",
          description: "Top-250 city chairs, coalition leads, and campus chapter gaps.",
          kind: "report",
          priority: "high",
        },
        {
          id: "leader-dashboard",
          title: "Leader dashboard",
          href: "/election-plan/operators/leader-dashboard",
          description: "Statewide My Five gaps and per-leader team health rollup.",
          kind: "report",
          priority: "high",
        },
        {
          id: "heatmap",
          title: "Command heatmap review",
          href: "/election-plan/operators/leaders/command",
          description: "Quiet leaders need first touch.",
          kind: "report",
          priority: "high",
        },
        {
          id: "activity-feed",
          title: "Recent activity feed",
          href: "#activity",
          description: "Operator-tagged entries.",
          kind: "report",
          priority: "medium",
        },
      ],
    },
    tools: {
      id: "tools",
      title: "Tools & templates",
      intro: "",
      items: [],
    },
  },
};

function injectDynamicHrefs(
  page: LaneDrillDownPage,
  links: ResolvedLeaderLink[],
  leaderSlug: string,
  isSelf: boolean,
): LaneDrillDownPage {
  const wb = workbenchHref(links);
  const county = primaryCountyLink(links);
  const base = workbenchBasePath(leaderSlug, isSelf);

  const patchItems = (items: LaneDrillDownItem[]): LaneDrillDownItem[] =>
    items.map((item) => {
      if (item.id === "community-wb" && wb) return { ...item, href: wb };
      if (item.id === "county-playbook" && county) return { ...item, href: county.href };
      if (item.id === "county-reg" && county) return { ...item, href: county.href };
      if (item.id === "campus-wb" && wb) return { ...item, href: wb };
      if (item.id === "event-wb" && wb) return { ...item, href: `${wb}#events` };
      if (
        item.id === "field-log" ||
        item.id === "attendance-log" ||
        item.id === "conversation-log" ||
        item.id === "conversation-reach" ||
        item.id === "partner-touch" ||
        item.id === "campus-field" ||
        item.id === "reg-log"
      ) {
        return { ...item, href: `${base}#field-log` };
      }
      if (item.id === "voter-reg-lane") {
        return {
          ...item,
          href: isSelf
            ? leaderLaneDrillDownMeHref("voter-registration")
            : leaderLaneDrillDownHref(leaderSlug, "voter-registration"),
        };
      }
      if (item.href?.startsWith("#")) {
        return { ...item, href: `${base}${item.href}` };
      }
      return item;
    });

  return {
    ...page,
    workCompletion: { ...page.workCompletion, items: patchItems(page.workCompletion.items) },
    organizing: { ...page.organizing, items: patchItems(page.organizing.items) },
    reporting: { ...page.reporting, items: patchItems(page.reporting.items) },
    tools: { ...page.tools, items: patchItems(page.tools.items) },
  };
}

export function buildLaneDrillDownPage(
  laneId: VolunteerTeamLaneId,
  leader: VolunteerLeader,
  areaLinks: ResolvedLeaderLink[],
  opts?: { isSelf?: boolean },
): LaneDrillDownPage | null {
  const base = BASE[laneId];
  if (!base) return null;
  const page: LaneDrillDownPage = { laneId, ...base };
  return injectDynamicHrefs(page, areaLinks, leader.slug, Boolean(opts?.isSelf));
}

export function leaderLaneDrillDownHref(slug: string, laneId: VolunteerTeamLaneId): string {
  return `/election-plan/operators/leaders/${slug}/lane/${laneId}`;
}

export function leaderLaneDrillDownMeHref(laneId: VolunteerTeamLaneId): string {
  return `/election-plan/operators/leaders/me/lane/${laneId}`;
}

export function isValidLeaderLane(laneId: string): laneId is VolunteerTeamLaneId {
  return VOLUNTEER_TEAM_LANES.some((l) => l.id === laneId);
}

export function laneLabelForId(laneId: VolunteerTeamLaneId): string {
  return laneLabel(laneId);
}
