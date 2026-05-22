import type { RoleCopilotId } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";

const FORBIDDEN_PATTERNS = [
  /send.*email/i,
  /mass.*(sms|text)/i,
  /promote.*gcal/i,
  /post.*fin/i,
  /voter.*export/i,
  /auto.*publish/i,
];

const GATED_PATTERNS = [/approve/i, /deny/i, /hold/i, /print/i, /promote/i, /send/i, /export/i];

export type SafeActionRoute = {
  label: string;
  href: string;
  risk: "safe" | "gated" | "forbidden";
  blocked: boolean;
  reason?: string;
};

export function routeCopilotSafeActions(
  role: RoleCopilotId,
  month = "2026-03",
): SafeActionRoute[] {
  const def = getRoleCopilot(role);
  if (!def) return [];
  const routes: SafeActionRoute[] = [];
  for (const task of def.firstTasks) {
    routes.push({ label: task.label, href: task.href.replace("2026-03", month), risk: "safe", blocked: false });
  }
  for (const action of def.safeActions) {
    routes.push({ label: action, href: "#", risk: "safe", blocked: false });
  }
  for (const action of def.gatedActions) {
    const blocked = FORBIDDEN_PATTERNS.some((p) => p.test(action));
    routes.push({
      label: action,
      href: "#",
      risk: blocked ? "forbidden" : "gated",
      blocked,
      reason: blocked ? "Human gate required — never autonomous." : "Supervisor or explicit click required.",
    });
  }
  return routes;
}

export function isHighRiskAutonomousAction(actionLabel: string): boolean {
  if (FORBIDDEN_PATTERNS.some((p) => p.test(actionLabel))) return true;
  return GATED_PATTERNS.some((p) => p.test(actionLabel));
}

export function filterBlockedActions<T extends { label: string }>(actions: T[]): T[] {
  return actions.filter((a) => !isHighRiskAutonomousAction(a.label));
}
