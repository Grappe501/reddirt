import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import {
  canAccessCoalitionCommand,
  canAccessCommsCommand,
  canAccessEventsCommand,
  canAccessGrassrootsFundraisingSettlement,
  canAccessLaneCoverageCommand,
  canAccessLeaderDashboardCommand,
  canAccessVolunteerIntakeOps,
  canAccessVoterRegistrationCommand,
  getEffectiveTeamLanes,
} from "@/lib/volunteers/leader-roster";
import {
  laneLabelForId,
  leaderLaneDrillDownHref,
  leaderLaneDrillDownMeHref,
} from "@/lib/volunteers/lane-drill-down-config";
import { resolveLeaderPersonalLinks } from "@/lib/volunteers/resolve-leader-links";
import { resolveLeaderResidence } from "@/lib/volunteers/resolve-leader-residence";
import { resolveLeaderWorkbenchTemplates } from "@/lib/volunteers/leader-workbench-templates";
import { tierById } from "@/lib/volunteers/operations-command-ladder";
import type { VolunteerLeader, VolunteerTeamLaneId } from "@/lib/volunteers/types";

export type LeaderWorkPageCategory =
  | "command"
  | "daily"
  | "lane"
  | "geography"
  | "projects"
  | "power-of-5"
  | "template"
  | "reporting";

export type LeaderWorkPage = {
  id: string;
  title: string;
  description: string;
  href: string;
  category: LeaderWorkPageCategory;
  priority: "high" | "medium" | "low";
};

export type LeaderWorkPagesPayload = {
  pages: LeaderWorkPage[];
  byCategory: Record<LeaderWorkPageCategory, LeaderWorkPage[]>;
  lanePages: Array<{ laneId: VolunteerTeamLaneId; label: string; href: string }>;
  commandUp: { label: string; href: string; receives: string } | null;
  commandDown: { label: string; href: string; sends: string } | null;
};

const CATEGORY_ORDER: LeaderWorkPageCategory[] = [
  "command",
  "daily",
  "lane",
  "geography",
  "projects",
  "power-of-5",
  "template",
  "reporting",
];

const CATEGORY_LABELS: Record<LeaderWorkPageCategory, string> = {
  command: "Command & direction",
  daily: "Daily operator tools",
  lane: "Lane work pages",
  geography: "City & county playbooks",
  projects: "Projects & campaigns",
  "power-of-5": "Power of 5",
  template: "Role template tools",
  reporting: "Reporting & feedback",
};

export function leaderWorkPageCategoryLabel(category: LeaderWorkPageCategory): string {
  return CATEGORY_LABELS[category];
}

function workbenchBase(leader: VolunteerLeader, isSelf: boolean): string {
  return isSelf ? "/election-plan/operators/leaders/me" : leaderWorkbenchHref(leader.slug);
}

function laneHref(leader: VolunteerLeader, laneId: VolunteerTeamLaneId, isSelf: boolean): string {
  return isSelf ? leaderLaneDrillDownMeHref(laneId) : leaderLaneDrillDownHref(leader.slug, laneId);
}

function pushUnique(pages: LeaderWorkPage[], page: LeaderWorkPage): void {
  if (pages.some((p) => p.id === page.id)) return;
  pages.push(page);
}

function groupByCategory(pages: LeaderWorkPage[]): Record<LeaderWorkPageCategory, LeaderWorkPage[]> {
  const byCategory = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, [] as LeaderWorkPage[]]),
  ) as Record<LeaderWorkPageCategory, LeaderWorkPage[]>;
  for (const page of pages) {
    byCategory[page.category].push(page);
  }
  return byCategory;
}

/** v4 work surface — every leader gets role-appropriate operator pages with live links. */
export function resolveLeaderWorkPages(
  leader: VolunteerLeader,
  opts?: { isSelf?: boolean },
): LeaderWorkPagesPayload {
  const isSelf = Boolean(opts?.isSelf);
  const base = workbenchBase(leader, isSelf);
  const pages: LeaderWorkPage[] = [];
  const lanes = getEffectiveTeamLanes(leader);
  const residence = resolveLeaderResidence(leader);
  const areaLinks = resolveLeaderPersonalLinks(leader);
  const templates = resolveLeaderWorkbenchTemplates(leader);

  const lanePages = lanes.map((laneId) => ({
    laneId,
    label: laneLabelForId(laneId),
    href: laneHref(leader, laneId, isSelf),
  }));

  // —— Command & direction ——
  pushUnique(pages, {
    id: "operators-hub",
    title: "Operators hub",
    description: "Statewide command entry — intake, lanes, leader roster.",
    href: "/election-plan/operators",
    category: "command",
    priority: "medium",
  });

  if (canAccessLeaderDashboardCommand(leader) || leader.commandAccess || leader.assistantCm) {
    pushUnique(pages, {
      id: "leader-command",
      title: "Leader command heatmap",
      description: "Who is active, quiet, and missing My Five — coach from here.",
      href: "/election-plan/operators/leaders/command",
      category: "command",
      priority: "high",
    });
    pushUnique(pages, {
      id: "leader-dashboard-roll",
      title: "Leader dashboard rollup",
      description: "Statewide My Five and team health across all field leaders.",
      href: "/election-plan/operators/leader-dashboard",
      category: "command",
      priority: "high",
    });
  }

  if (leader.commandAccess || leader.assistantCm) {
    pushUnique(pages, {
      id: "cm-dashboard",
      title: "Campaign manager board",
      description: "CM priorities, events, finance, and statewide rollups.",
      href: "/admin/campaign-manager-dashboard",
      category: "command",
      priority: "high",
    });
  }

  if (canAccessVolunteerIntakeOps(leader)) {
    pushUnique(pages, {
      id: "volunteer-intake",
      title: "Volunteer intake queue",
      description: "Review sign-ups, place leaders, unlock workbenches.",
      href: "/election-plan/operators/volunteer-intake",
      category: "command",
      priority: "high",
    });
  }

  if (canAccessCommsCommand(leader)) {
    pushUnique(pages, {
      id: "comms-command",
      title: "Comms command",
      description: "Editorial queue, email triage, county comms coverage.",
      href: "/election-plan/operators/comms-command",
      category: "command",
      priority: "medium",
    });
  }

  if (canAccessVoterRegistrationCommand(leader)) {
    pushUnique(pages, {
      id: "vr-command",
      title: "Voter registration command",
      description: "Registration drives, Help 10, county VR goals.",
      href: "/election-plan/operators/voter-registration",
      category: "command",
      priority: "medium",
    });
  }

  if (canAccessEventsCommand(leader)) {
    pushUnique(pages, {
      id: "events-command",
      title: "Events & Mobilize command",
      description: "Stops, Mobilize gaps, promotion readiness.",
      href: "/election-plan/operators/events-command",
      category: "command",
      priority: "medium",
    });
  }

  if (canAccessCoalitionCommand(leader)) {
    pushUnique(pages, {
      id: "coalition-command",
      title: "Coalition command",
      description: "Partner workbenches, liaison roster, readiness.",
      href: "/election-plan/operators/coalition-command",
      category: "command",
      priority: "medium",
    });
  }

  if (canAccessLaneCoverageCommand(leader)) {
    pushUnique(pages, {
      id: "lane-coverage",
      title: "Lane coverage boards",
      description: "City chairs, coalition owners, campus slots — gap view.",
      href: "/election-plan/operators/lane-coverage",
      category: "command",
      priority: "medium",
    });
  }

  if (canAccessGrassrootsFundraisingSettlement(leader)) {
    pushUnique(pages, {
      id: "grassroots-settlement",
      title: "Grassroots fundraising settlement",
      description: "Commission registry, QR attribution, treasurer approval.",
      href: "/election-plan/operators/grassroots-fundraising-settlement",
      category: "command",
      priority: "medium",
    });
  }

  // —— Daily tools ——
  pushUnique(pages, {
    id: "my-work",
    title: "My work inbox",
    description: "Assigned tasks, coaching items, and CRM follow-ups.",
    href: isSelf ? `${base}#my-work` : "/election-plan/operators/my-work",
    category: "daily",
    priority: "high",
  });

  pushUnique(pages, {
    id: "field-log",
    title: "Field log",
    description: "Log conversations, volunteers, and leaders — tagged with your initials.",
    href: `${base}#field-log`,
    category: "daily",
    priority: "high",
  });

  pushUnique(pages, {
    id: "messages",
    title: "Message hub",
    description: "Conversation prompts and Stories hub for your geography.",
    href: "/messages",
    category: "daily",
    priority: "medium",
  });

  pushUnique(pages, {
    id: "war-room",
    title: "Election Plan war room",
    description: "Four lanes, volunteer leaders, and statewide progress.",
    href: "/election-plan",
    category: "daily",
    priority: "medium",
  });

  pushUnique(pages, {
    id: "search",
    title: "Election Plan search",
    description: "Find counties, workbenches, debate prep, and executive book.",
    href: "/election-plan/search",
    category: "daily",
    priority: "low",
  });

  // —— Lane drill-down pages ——
  for (const lp of lanePages) {
    pushUnique(pages, {
      id: `lane-${lp.laneId}`,
      title: `${lp.label} lane work page`,
      description: `Checklists, organizing tools, and reporting for the ${lp.label.toLowerCase()} lane.`,
      href: lp.href,
      category: "lane",
      priority: lanes.length <= 3 ? "high" : "medium",
    });
  }

  // —— Geography ——
  if (residence.links.countyPlaybook) {
    pushUnique(pages, {
      id: "county-playbook",
      title: `${residence.countyName ?? "County"} playbook`,
      description: "County intelligence, strategy, field, and leadership drill-down.",
      href: residence.links.countyPlaybook,
      category: "geography",
      priority: "high",
    });
  }
  if (residence.links.cityBrief) {
    pushUnique(pages, {
      id: "city-brief",
      title: `${residence.cityLabel ?? "City"} brief`,
      description: "Local narrative, location metrics, and priority moves.",
      href: residence.links.cityBrief,
      category: "geography",
      priority: "high",
    });
  }
  if (residence.links.cityWorkbench) {
    pushUnique(pages, {
      id: "city-workbench",
      title: `${residence.cityLabel ?? "City"} community workbench`,
      description: "Events, leadership table, relationships, and field log.",
      href: residence.links.cityWorkbench,
      category: "geography",
      priority: "high",
    });
  }
  if (residence.links.countyPathToVictory) {
    pushUnique(pages, {
      id: "county-ptv",
      title: `${residence.countyName ?? "County"} path to victory`,
      description: "Electoral math, turnout targets, and county victory plan.",
      href: residence.links.countyPathToVictory,
      category: "geography",
      priority: "medium",
    });
  }

  for (const link of areaLinks) {
    if (link.kind === "county" || link.kind === "city" || link.kind === "program") {
      pushUnique(pages, {
        id: `area-${link.href}`,
        title: link.label,
        description: "Connected geography or program from your roster assignment.",
        href: link.href,
        category: "geography",
        priority: "medium",
      });
    }
  }

  // —— Projects ——
  pushUnique(pages, {
    id: "campaign-projects",
    title: "Campaign projects",
    description: "Multi-lane coordinated pushes — VR drives, coalition builds, event readiness.",
    href: "/election-plan/operators/projects",
    category: "projects",
    priority: "high",
  });

  if (leader.campusLeadCampusSlug) {
    pushUnique(pages, {
      id: "campus-chapter",
      title: "Campus chapter hub",
      description: "Students for Arkansas chapter tools and captain pipeline.",
      href: `/election-plan/campuses/${leader.campusLeadCampusSlug}`,
      category: "projects",
      priority: "high",
    });
  }

  // —— Power of 5 ——
  pushUnique(pages, {
    id: "po5-walkthrough",
    title: "Power of 5 walkthrough",
    description: "Relational organizing structure — start here for My Five.",
    href: "/onboarding/power-of-5",
    category: "power-of-5",
    priority: "high",
  });

  pushUnique(pages, {
    id: "po5-roster",
    title: "My Five & team roster",
    description: "Edit My Five, branches, and team members on this workbench.",
    href: `${base}#power-of-5`,
    category: "power-of-5",
    priority: "high",
  });

  pushUnique(pages, {
    id: "po5-command",
    title: "Power of 5 command center",
    description: "Election Plan relational command — requires portal login.",
    href: "/election-plan/power-of-5/command-center",
    category: "power-of-5",
    priority: "medium",
  });

  pushUnique(pages, {
    id: "po5-dashboard",
    title: "Leader Po5 dashboard",
    description: "Live My Five completeness and follow-up queue for your slug.",
    href: "/election-plan/operators/leader-dashboard",
    category: "power-of-5",
    priority: "medium",
  });

  // —— Template tool links ——
  for (const template of templates) {
    for (const tool of template.toolLinks ?? []) {
      pushUnique(pages, {
        id: `tpl-${template.id}-${tool.href}`,
        title: tool.label,
        description: tool.description,
        href: tool.href,
        category: "template",
        priority: "high",
      });
    }
  }

  // —— Reporting ——
  pushUnique(pages, {
    id: "leader-dashboard-report",
    title: "Team health & follow-ups",
    description: "Po5 gaps, follow-up debt, and coaching signals for your team.",
    href: "/election-plan/operators/leader-dashboard",
    category: "reporting",
    priority: "medium",
  });

  pushUnique(pages, {
    id: "operators-field",
    title: "Field operators roster",
    description: "3-letter initials whitelist and field-entry requirements.",
    href: "/election-plan/operators/field",
    category: "reporting",
    priority: "low",
  });

  if (leader.volunteerManagerInterim || leader.workbenchTemplates?.includes("volunteer_manager")) {
    pushUnique(pages, {
      id: "intake-report",
      title: "Intake activation report",
      description: "Pipeline counts and placement queue for statewide volunteers.",
      href: "/election-plan/operators/volunteer-intake",
      category: "reporting",
      priority: "high",
    });
  }

  const currentTier = tierById("leader_workbench");
  const aboveTier = tierById("leader_command");
  const belowTier = tierById("volunteer_field");

  return {
    pages,
    byCategory: groupByCategory(pages),
    lanePages,
    commandUp: aboveTier
      ? {
          label: aboveTier.label,
          href: aboveTier.dashboardHref,
          receives: aboveTier.feedbackReceives,
        }
      : null,
    commandDown: belowTier
      ? {
          label: belowTier.label,
          href: `${base}#power-of-5`,
          sends: currentTier?.commandsDown ?? belowTier.commandsDown,
        }
      : null,
  };
}

export { CATEGORY_ORDER as LEADER_WORK_PAGE_CATEGORY_ORDER };
