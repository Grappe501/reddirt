import { existsSync } from "node:fs";
import { join } from "node:path";

import { COMMUNITY_WORKBENCH_MIGRATIONS } from "./pilot";
import { communityWorkbenchEventHref } from "./event-links";
import { communityWorkbenchHref } from "./links";
import type { CommunityWorkbenchCommitteeRow, CommunityWorkbenchEventRow, CommunityWorkbenchView } from "./types";

export type PilotSmokeStep = {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
  href?: string;
};

export type PilotWorkbenchValidation = {
  slug: string;
  name: string;
  context: string;
  kind: "city" | "event" | "optional_city";
  workbenchSlug?: string;
  eventSlug?: string;
  steps: PilotSmokeStep[];
  stepsPassed: number;
  allPass: boolean;
};

export type DeployReadinessCheck = {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
};

export function evaluatePilotWorkbench(
  wb: Pick<CommunityWorkbenchView, "slug" | "name" | "leadership" | "events">,
  context: string,
): PilotWorkbenchValidation {
  const communityLead = wb.leadership.find((l) => l.roleKey === "community_lead");
  const hasLead = Boolean(communityLead?.personName?.trim());
  const activeEvents = wb.events.filter((e) => e.status !== "cancelled");
  const hasEvent = activeEvents.length > 0;
  const aarEvent = activeEvents.find((e) => e.status === "aar_complete" && e.aarBody?.trim());
  const hasAar = Boolean(aarEvent);

  const baseHref = communityWorkbenchHref(wb.slug);

  const steps: PilotSmokeStep[] = [
    {
      id: "assign_community_lead",
      label: "First Community Lead assigned",
      pass: hasLead,
      detail: hasLead ? communityLead?.personName ?? "Assigned" : "Open Leadership → assign Community Lead",
      href: `${baseHref}#leadership`,
    },
    {
      id: "create_live_event",
      label: "First live event created",
      pass: hasEvent,
      detail: hasEvent
        ? `${activeEvents.length} active event${activeEvents.length === 1 ? "" : "s"}`
        : "Open Events → create your first event",
      href: `${baseHref}#events`,
    },
    {
      id: "complete_aar",
      label: "First After Action Report complete",
      pass: hasAar,
      detail: hasAar ? `"${aarEvent?.title}" marked after-action complete` : "Execute event → write AAR → set status After-action complete",
      href: `${baseHref}#events`,
    },
  ];

  const stepsPassed = steps.filter((s) => s.pass).length;

  return {
    slug: wb.slug,
    name: wb.name,
    context,
    kind: "city",
    workbenchSlug: wb.slug,
    steps,
    stepsPassed,
    allPass: steps.every((s) => s.pass),
  };
}

export function evaluatePilotEvent(
  meta: { workbenchSlug: string; eventSlug: string; name: string; context: string },
  event: CommunityWorkbenchEventRow,
  committee: CommunityWorkbenchCommitteeRow | null,
): PilotWorkbenchValidation {
  const baseHref = communityWorkbenchEventHref(meta.workbenchSlug, meta.eventSlug);
  const activeStatuses = new Set(["planned", "confirmed", "executed", "aar_complete"]);
  const isActive = activeStatuses.has(event.status);
  const hasCommittee = Boolean(committee?.name?.trim());
  const assignments = event.assignments ?? [];
  const filledRoles = assignments.filter((a) => a.assignee?.trim() && a.assignee.trim().toUpperCase() !== "OPEN");
  const hasEventChair = filledRoles.some((a) => /event chair/i.test(a.role));
  const hasRunOfShow = (event.runOfShow?.length ?? 0) >= 3;
  const hasAssignments = assignments.length >= 2;
  const aarComplete = event.status === "aar_complete" && Boolean(event.aarBody?.trim());

  const steps: PilotSmokeStep[] = [
    {
      id: "event_workbench_loads",
      label: "Event workbench seeded and active",
      pass: isActive && event.title.length > 0,
      detail: isActive ? `${event.title} · ${event.status}` : "Seed G&G event on Sherwood workbench",
      href: baseHref,
    },
    {
      id: "event_committee_linked",
      label: "Working committee linked",
      pass: hasCommittee,
      detail: hasCommittee ? committee!.name : "Link Grassroots & Guitar Strings Working Committee",
      href: `${baseHref}#committee`,
    },
    {
      id: "event_chair_assigned",
      label: "Event Chair assigned (not city lead)",
      pass: hasEventChair,
      detail: hasEventChair
        ? filledRoles.find((a) => /event chair/i.test(a.role))?.assignee ?? "Assigned"
        : "Assign Event Chair on event workbench only",
      href: `${baseHref}#event-ops`,
    },
    {
      id: "run_of_show",
      label: "Run-of-show rows (3+)",
      pass: hasRunOfShow,
      detail: hasRunOfShow ? `${event.runOfShow.length} rows` : "Add run-of-show on event ops panel",
      href: `${baseHref}#event-ops`,
    },
    {
      id: "volunteer_assignments",
      label: "Volunteer / role assignments (2+)",
      pass: hasAssignments,
      detail: hasAssignments ? `${assignments.length} roles` : "Add assignments on event ops panel",
      href: `${baseHref}#event-ops`,
    },
    {
      id: "complete_aar",
      label: "After Action Report complete",
      pass: aarComplete,
      detail: aarComplete ? "AAR saved" : "Execute → attendance → AAR → after-action complete",
      href: `${baseHref}#event-ops`,
    },
  ];

  const stepsPassed = steps.filter((s) => s.pass).length;

  return {
    slug: meta.eventSlug,
    name: meta.name,
    context: meta.context,
    kind: "event",
    workbenchSlug: meta.workbenchSlug,
    eventSlug: meta.eventSlug,
    steps,
    stepsPassed,
    allPass: steps.every((s) => s.pass),
  };
}

export function runDeployReadinessChecks(root = process.cwd()): DeployReadinessCheck[] {
  const checks: DeployReadinessCheck[] = [];

  checks.push({
    id: "netlify-doc",
    label: "Netlify env scoping guide present",
    pass: existsSync(join(root, "docs/NETLIFY_FIRST_DEPLOY.md")),
    detail: "docs/NETLIFY_FIRST_DEPLOY.md §6",
  });

  checks.push({
    id: "deploy-gate-doc",
    label: "Community Workbench deploy gate doc present",
    pass: existsSync(join(root, "docs/COMMUNITY_WORKBENCH_V1_2_DEPLOY_GATE.md")),
  });

  checks.push({
    id: "pilot-doc",
    label: "v1.3 pilot smoke doc present",
    pass: existsSync(join(root, "docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md")),
  });

  checks.push({
    id: "lambda-env-script",
    label: "Lambda env budget verification script present",
    pass: existsSync(join(root, "scripts/verify-netlify-lambda-env-budget.cjs")),
    detail: "Run before deploy; scope vars in Netlify UI",
  });

  for (const migration of COMMUNITY_WORKBENCH_MIGRATIONS) {
    checks.push({
      id: `migration:${migration}`,
      label: `Migration file: ${migration}`,
      pass: existsSync(join(root, "prisma/migrations", migration, "migration.sql")),
    });
  }

  checks.push({
    id: "defect-api",
    label: "Pilot defect log API route present",
    pass: existsSync(join(root, "src/app/api/election-plan/workbenches/defects/route.ts")),
  });

  return checks;
}

export function deployReadinessSummary(checks: DeployReadinessCheck[]): {
  passed: number;
  total: number;
  allPass: boolean;
} {
  const passed = checks.filter((c) => c.pass).length;
  return { passed, total: checks.length, allPass: passed === checks.length };
}

export function verifyMigrationFilesOnDisk(root = process.cwd()): { pass: boolean; missing: string[] } {
  const missing: string[] = [];
  const migrationsDir = join(root, "prisma/migrations");
  if (!existsSync(migrationsDir)) {
    return { pass: false, missing: ["prisma/migrations"] };
  }
  for (const name of COMMUNITY_WORKBENCH_MIGRATIONS) {
    if (!existsSync(join(migrationsDir, name, "migration.sql"))) {
      missing.push(name);
    }
  }
  return { pass: missing.length === 0, missing };
}
