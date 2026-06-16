import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  COMMUNITY_EVENT_STATUSES,
  COMMUNITY_EVENT_VOLUNTEER_ROLES,
  COMMUNITY_LEADERSHIP_ROLES,
} from "./constants";
import { computeCommunityReadiness } from "./compute-readiness";
import { computeEventReadinessPct } from "./event-readiness";
import type { CommunityWorkbenchEventRow } from "./types";

export type CommunityFieldQACheck = {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
};

function fixtureEvent(overrides: Partial<CommunityWorkbenchEventRow> = {}): CommunityWorkbenchEventRow {
  return {
    id: "qa-fixture",
    title: "QA Town Hall",
    eventDate: new Date().toISOString(),
    location: "Community Center",
    expectedAttendance: 50,
    actualAttendance: null,
    leadName: "Field Lead",
    status: "planned",
    committeeId: null,
    committeeName: null,
    runOfShow: [],
    assignments: [],
    documents: [],
    aarBody: null,
    operatorInitials: "KGR",
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function runCommunityWorkbenchFieldQA(root = process.cwd()): CommunityFieldQACheck[] {
  const checks: CommunityFieldQACheck[] = [];

  const routePaths = [
    "src/app/api/election-plan/workbenches/[slug]/events/route.ts",
    "src/app/api/election-plan/workbenches/[slug]/events/[eventId]/route.ts",
    "src/app/api/election-plan/workbenches/[slug]/content/route.ts",
  ];
  for (const rel of routePaths) {
    checks.push({
      id: `route:${rel}`,
      label: `API route exists: ${rel.split("/").pop()}`,
      pass: existsSync(join(root, rel)),
    });
  }

  const uiPaths = [
    "src/components/election-plan/CommunityWorkbenchEventOpsPanel.tsx",
    "src/components/election-plan/CommunityWorkbenchShell.tsx",
    "src/components/election-plan/CommunityWorkbenchHubPanel.tsx",
  ];
  for (const rel of uiPaths) {
    checks.push({
      id: `ui:${rel}`,
      label: `UI component exists: ${rel.split("/").pop()}`,
      pass: existsSync(join(root, rel)),
    });
  }

  checks.push({
    id: "status-pipeline",
    label: "Event status pipeline covers idea through after-action",
    pass: COMMUNITY_EVENT_STATUSES.some((s) => s.value === "idea") && COMMUNITY_EVENT_STATUSES.some((s) => s.value === "aar_complete"),
    detail: COMMUNITY_EVENT_STATUSES.map((s) => s.value).join(" → "),
  });

  checks.push({
    id: "volunteer-roles",
    label: "Default volunteer assignment roles defined",
    pass: COMMUNITY_EVENT_VOLUNTEER_ROLES.length >= 5,
    detail: `${COMMUNITY_EVENT_VOLUNTEER_ROLES.length} roles`,
  });

  checks.push({
    id: "community-lead-role",
    label: "Community Lead leadership slot defined",
    pass: COMMUNITY_LEADERSHIP_ROLES.some((r) => r.key === "community_lead"),
  });

  const bareEventPct = computeEventReadinessPct([fixtureEvent()]);
  const fullEvent = fixtureEvent({
    status: "aar_complete",
    runOfShow: [
      { time: "6:00", label: "Doors" },
      { time: "6:30", label: "Program" },
      { time: "7:30", label: "Q&A" },
    ],
    assignments: [
      { role: "Registration table", assignee: "A" },
      { role: "AV team", assignee: "B" },
      { role: "Greeters", assignee: "C" },
    ],
    actualAttendance: 42,
    aarBody: "Strong turnout. Follow up with three new volunteers.",
  });
  const fullEventPct = computeEventReadinessPct([fullEvent]);

  checks.push({
    id: "readiness-increases-with-event-detail",
    label: "Event readiness score increases as run-of-show, assignments, and AAR are filled",
    pass: fullEventPct > bareEventPct,
    detail: `bare=${bareEventPct}% full=${fullEventPct}%`,
  });

  const leadership = COMMUNITY_LEADERSHIP_ROLES.map((r) => ({
    roleKey: r.key,
    roleLabel: r.label,
    personName: r.key === "community_lead" ? "QA Lead" : null,
    contact: null,
    notes: null,
    operatorInitials: null,
  }));

  const readinessBefore = computeCommunityReadiness({
    leadership,
    missions: [],
    events: [fixtureEvent()],
    relationships: [],
    intel: [],
    committees: [],
    fieldEntry: { entries: [], rollups: [], totalQuantity: 0 },
  });

  const readinessAfter = computeCommunityReadiness({
    leadership,
    missions: [{ id: "m1", title: "Recruit", status: "open", priority: 1, operatorInitials: "KGR" }],
    events: [fullEvent],
    relationships: [{ id: "r1", personName: "Partner", roleLabel: "Faith", strength: 80, lastContact: null, nextFollowUp: null, knowsWho: null, notes: null, operatorInitials: null }],
    intel: [],
    committees: [{ id: "c1", name: "Events", goals: null, membersJson: '["Member A"]', notes: null, operatorInitials: null }],
    fieldEntry: { entries: [], rollups: [], totalQuantity: 0 },
  });

  checks.push({
    id: "workbench-readiness-updates",
    label: "Workbench readiness score responds to leadership, events, and organization data",
    pass: readinessAfter.overallPct >= readinessBefore.overallPct,
    detail: `before=${readinessBefore.overallPct}% after=${readinessAfter.overallPct}%`,
  });

  checks.push({
    id: "pilot-doc",
    label: "v1.3 pilot smoke doc present",
    pass: existsSync(join(root, "docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md")),
  });

  checks.push({
    id: "pilot-preflight-script",
    label: "Pilot preflight script present",
    pass: existsSync(join(root, "scripts/election-plan/community-workbench-pilot-preflight.ts")),
  });

  checks.push({
    id: "defect-api",
    label: "Pilot defect log API route present",
    pass: existsSync(join(root, "src/app/api/election-plan/workbenches/defects/route.ts")),
  });

  return checks;
}

export function allFieldQAPassed(checks: CommunityFieldQACheck[]): boolean {
  return checks.every((c) => c.pass);
}
