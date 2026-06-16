import { existsSync } from "node:fs";
import { join } from "node:path";

import { COMMUNITY_WORKBENCH_MIGRATIONS } from "./pilot";
import type { CommunityWorkbenchView } from "./types";
import { communityWorkbenchHref } from "./links";

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
