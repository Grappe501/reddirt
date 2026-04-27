/**
 * Pope County — deterministic demo relational graph for dashboard v2 only.
 * Synthetic labels only; no voter file, no real contact tokens, no street-level PII.
 */
import type {
  OrganizingActivity,
  PowerGeographyAttachment,
  PowerNode,
  PowerNodeStatus,
  PowerTeam,
  PowerTeamStatus,
  PowerUser,
  RelationshipEdge,
} from "@/lib/power-of-5/types";
import { calculateTeamCompletion } from "@/lib/power-of-5/kpi";

const DEMO_ANCHOR_ISO = "2026-04-20T15:00:00.000Z";

const POPE_GEO: PowerGeographyAttachment = {
  state: { stateCode: "AR", stateFips: "05", displayName: "Arkansas" },
  region: { regionKey: "river-valley", displayName: "River Valley" },
  county: { countySlug: "pope-county", displayName: "Pope County", countyFips: "05115" },
  city: null,
  precinct: null,
};

const TEAM_NAMES = [
  "Russellville North",
  "Russellville Campus",
  "Atkins Circle",
  "Dover Hosts",
  "Pottsville Five",
  "River Valley Core",
  "Russellville South (building)",
  "Atkins Satellite",
  "Dover — early team",
  "Pottsville starter",
] as const;

/** Roster sizes per team index 0..9 — first six are complete (5 each); rest are forming. */
const TEAM_ROSTER_SIZES = [5, 5, 5, 5, 5, 5, 3, 4, 3, 2] as const;

const TEAM_STATUS: PowerTeamStatus[] = [
  "complete",
  "complete",
  "complete",
  "complete",
  "complete",
  "complete",
  "forming",
  "forming",
  "forming",
  "forming",
];

export type PopeDemoGraphNodeLayout = {
  nodeId: string;
  xPct: number;
  yPct: number;
  isLeader: boolean;
};

export type PopeDemoGraphTeamLayout = {
  teamId: string;
  label: string;
  cxPct: number;
  cyPct: number;
  status: PowerTeamStatus;
  nodes: PopeDemoGraphNodeLayout[];
};

export type PopeDemoRelationalGraph = {
  generatedAt: string;
  geography: PowerGeographyAttachment;
  users: PowerUser[];
  teams: PowerTeam[];
  nodes: PowerNode[];
  edges: RelationshipEdge[];
  activities: OrganizingActivity[];
  layout: PopeDemoGraphTeamLayout[];
  summary: {
    userCount: number;
    usersWithNode: number;
    pipelineUsersWithoutNode: number;
    teamCount: number;
    completeTeamCount: number;
    formingTeamCount: number;
    memberNodeCount: number;
    edgeCount: number;
    activityCount: number;
    conversationActivities: number;
    activeNodes: number;
    invitedNodes: number;
  };
};

function isoOffsetMinutes(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d.toISOString();
}

function buildTeamsAndNodes(): { teams: PowerTeam[]; nodes: PowerNode[] } {
  const teams: PowerTeam[] = [];
  const nodes: PowerNode[] = [];
  let nodeSeq = 0;

  for (let t = 0; t < TEAM_NAMES.length; t++) {
    const teamId = `pope-demo-team-${String(t + 1).padStart(2, "0")}`;
    const size = TEAM_ROSTER_SIZES[t];
    const status = TEAM_STATUS[t];
    const createdAt = isoOffsetMinutes(DEMO_ANCHOR_ISO, -7200 - t * 120);

    const memberNodeIds: string[] = [];
    for (let m = 0; m < size; m++) {
      nodeSeq += 1;
      const nodeId = `pope-demo-node-${String(nodeSeq).padStart(3, "0")}`;
      memberNodeIds.push(nodeId);
      const isLeader = m === 0;
      const nStatus: PowerNodeStatus =
        isLeader ? "active" : (t * 3 + m) % 5 === 0 ? "invited" : "active";
      nodes.push({
        id: nodeId,
        userId: null,
        status: nStatus,
        teamId,
        rosterLabel: isLeader ? `Lead · T${t + 1}` : `Member · T${t + 1}-${m}`,
        createdAt: isoOffsetMinutes(createdAt, m * 15),
        geography: POPE_GEO,
      });
    }

    const leaderNodeId = memberNodeIds[0];

    teams.push({
      id: teamId,
      name: TEAM_NAMES[t],
      leaderNodeId,
      targetSize: 5,
      status,
      geography: POPE_GEO,
      createdAt,
      updatedAt: isoOffsetMinutes(DEMO_ANCHOR_ISO, -t * 45),
      cohortKey: "pope-v2-dashboard-demo",
    });
  }

  return { teams, nodes };
}

function buildUsers(nodes: PowerNode[], pipelineExtra: number): PowerUser[] {
  const users: PowerUser[] = [];
  let u = 0;
  for (const n of nodes) {
    u += 1;
    const isLeader = n.rosterLabel?.startsWith("Lead");
    users.push({
      id: `pope-demo-user-${String(u).padStart(3, "0")}`,
      displayName: `Volunteer ${String(u).padStart(2, "0")}`,
      role: isLeader ? "power_team_leader" : "member",
      primaryNodeId: n.id,
      createdAt: isoOffsetMinutes(n.createdAt, -5),
      geography: POPE_GEO,
    });
  }
  for (let p = 0; p < pipelineExtra; p++) {
    u += 1;
    users.push({
      id: `pope-demo-user-${String(u).padStart(3, "0")}`,
      displayName: `Volunteer ${String(u).padStart(2, "0")}`,
      role: "member",
      primaryNodeId: null,
      createdAt: isoOffsetMinutes(DEMO_ANCHOR_ISO, -1400 - p * 60),
      geography: POPE_GEO,
    });
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.primaryNodeId) {
      const node = nodes.find((n) => n.id === user.primaryNodeId);
      if (node) {
        node.userId = user.id;
      }
    }
  }

  return users;
}

function buildEdges(teams: PowerTeam[], nodes: PowerNode[]): RelationshipEdge[] {
  const byTeam = new Map<string, PowerNode[]>();
  for (const n of nodes) {
    const list = byTeam.get(n.teamId) ?? [];
    list.push(n);
    byTeam.set(n.teamId, list);
  }

  const edges: RelationshipEdge[] = [];
  let e = 0;

  for (const team of teams) {
    const members = byTeam.get(team.id) ?? [];
    const leader = members.find((m) => m.id === team.leaderNodeId);
    if (!leader) continue;
    for (const m of members) {
      if (m.id === leader.id) continue;
      e += 1;
      edges.push({
        id: `pope-demo-edge-${String(e).padStart(4, "0")}`,
        fromNodeId: leader.id,
        toNodeId: m.id,
        kind: m.status === "invited" ? "invited" : "co_volunteer",
        visibility: "team",
        createdAt: isoOffsetMinutes(leader.createdAt, 20 + e),
      });
    }
  }

  /** Sparse cross-team mentor ties (organizing realism without dense clutter). */
  const mentorPairs: [string, string][] = [
    ["pope-demo-node-001", "pope-demo-node-011"],
    ["pope-demo-node-006", "pope-demo-node-016"],
    ["pope-demo-node-026", "pope-demo-node-031"],
  ];
  for (const [from, to] of mentorPairs) {
    if (nodes.some((n) => n.id === from) && nodes.some((n) => n.id === to)) {
      e += 1;
      edges.push({
        id: `pope-demo-edge-${String(e).padStart(4, "0")}`,
        fromNodeId: from,
        toNodeId: to,
        kind: "mentor",
        visibility: "leader",
        createdAt: isoOffsetMinutes(DEMO_ANCHOR_ISO, -e * 30),
      });
    }
  }

  return edges;
}

function buildActivities(nodes: PowerNode[]): OrganizingActivity[] {
  const types = ["conversation", "text", "phone", "door", "event_touch", "training"] as const;
  const pipelines = ["conversation", "followup", "activation", "volunteer"] as const;
  const acts: OrganizingActivity[] = [];
  let a = 0;
  const actors = nodes.filter((n) => n.status === "active");

  for (let i = 0; i < 96; i++) {
    const actor = actors[i % actors.length];
    a += 1;
    const type = types[i % types.length];
    const pipelineId = pipelines[i % pipelines.length];
    acts.push({
      id: `pope-demo-act-${String(a).padStart(4, "0")}`,
      actorNodeId: actor.id,
      type,
      pipelineId,
      pipelineStageId: `${pipelineId}_stage_${(i % 3) + 1}`,
      createdAt: isoOffsetMinutes(DEMO_ANCHOR_ISO, -i * 37 - (i % 5) * 12),
    });
  }

  return acts;
}

function buildLayout(teams: PowerTeam[], nodes: PowerNode[]): PopeDemoGraphTeamLayout[] {
  const byTeam = new Map<string, PowerNode[]>();
  for (const n of nodes) {
    const list = byTeam.get(n.teamId) ?? [];
    list.push(n);
    byTeam.set(n.teamId, list);
  }

  const cols = 5;
  const layouts: PopeDemoGraphTeamLayout[] = [];

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cxPct = 10 + col * 18;
    const cyPct = 18 + row * 42;
    const members = byTeam.get(team.id) ?? [];
    const n = members.length;
    const nodeLayouts: PopeDemoGraphNodeLayout[] = [];

    for (let j = 0; j < n; j++) {
      const node = members[j];
      const isLeader = node.id === team.leaderNodeId;
      if (isLeader) {
        nodeLayouts.push({ nodeId: node.id, xPct: cxPct, yPct: cyPct, isLeader: true });
      } else {
        const angle = (2 * Math.PI * (j - 1)) / Math.max(1, n - 1) - Math.PI / 2;
        const r = 7;
        nodeLayouts.push({
          nodeId: node.id,
          xPct: cxPct + r * Math.cos(angle),
          yPct: cyPct + r * Math.sin(angle),
          isLeader: false,
        });
      }
    }

    layouts.push({
      teamId: team.id,
      label: team.name,
      cxPct,
      cyPct,
      status: team.status,
      nodes: nodeLayouts,
    });
  }

  return layouts;
}

/**
 * Deterministic Pope-only demo graph: 50 users, 10 teams (6 complete / 4 forming), 42 roster nodes, synthetic activity.
 */
export function buildPopeDemoRelationalGraph(): PopeDemoRelationalGraph {
  const { teams, nodes } = buildTeamsAndNodes();
  const pipelineUsersWithoutNode = 8;
  const users = buildUsers(nodes, pipelineUsersWithoutNode);
  const edges = buildEdges(teams, nodes);
  const activities = buildActivities(nodes);
  const layout = buildLayout(teams, nodes);

  const completeTeamCount = teams.filter((t) => t.status === "complete").length;
  const formingTeamCount = teams.filter((t) => t.status === "forming").length;
  const conversationActivities = activities.filter((x) => x.type === "conversation").length;

  return {
    generatedAt: DEMO_ANCHOR_ISO,
    geography: POPE_GEO,
    users,
    teams,
    nodes,
    edges,
    activities,
    layout,
    summary: {
      userCount: users.length,
      usersWithNode: nodes.length,
      pipelineUsersWithoutNode,
      teamCount: teams.length,
      completeTeamCount,
      formingTeamCount,
      memberNodeCount: nodes.length,
      edgeCount: edges.length,
      activityCount: activities.length,
      conversationActivities,
      activeNodes: nodes.filter((n) => n.status === "active").length,
      invitedNodes: nodes.filter((n) => n.status === "invited").length,
    },
  };
}

/** Roll up demo KPIs aligned with `buildPopeDemoRelationalGraph` for a single source of truth. */
export function getPopeDemoPowerOfFiveRollup(graph: PopeDemoRelationalGraph) {
  const teamsIncomplete = graph.summary.formingTeamCount;
  const completionRate = calculateTeamCompletion({
    completeTeams: graph.summary.completeTeamCount,
    formedTeams: graph.summary.teamCount,
  });

  const invitedEdges = graph.edges.filter((e) => e.kind === "invited").length;
  const followUpsDue = Math.min(28, Math.max(8, Math.round(graph.summary.memberNodeCount * 0.22)));

  return {
    activeTeams: graph.summary.teamCount,
    completeTeams: graph.summary.completeTeamCount,
    teamsIncomplete,
    signedUp: graph.summary.userCount,
    invited: invitedEdges + graph.summary.invitedNodes,
    activated: graph.summary.activeNodes,
    conversations: graph.summary.conversationActivities,
    followUps: followUpsDue,
    weeklyGrowth: 3,
    leaderGaps: teamsIncomplete,
    completionRate,
  };
}
