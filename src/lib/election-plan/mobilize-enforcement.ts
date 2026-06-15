import { getMobilizeAutomationRules } from "@/lib/election-plan/load-movement-infrastructure";

export type MobilizeEnforcementResult = {
  required: boolean;
  warning: string | null;
  reasons: string[];
};

type StopLike = {
  eventName: string;
  mobilizeStatus: string;
  primaryLane?: string;
  county?: string;
  city?: string;
};

type Context = {
  volunteerGoal?: number;
  registrationGoal?: number;
  isCampusEvent?: boolean;
};

export function evaluateMobilizeRequired(stop: StopLike, context: Context = {}): MobilizeEnforcementResult {
  const rules = getMobilizeAutomationRules();
  const reasons: string[] = [];
  const hay = `${stop.eventName} ${stop.primaryLane ?? ""} ${stop.city ?? ""} ${stop.county ?? ""}`.toLowerCase();

  if ((context.volunteerGoal ?? 0) > 0) reasons.push("Volunteer goal > 0");
  if ((context.registrationGoal ?? 0) > 0) reasons.push("Registration goal > 0");
  if (context.isCampusEvent) reasons.push("Campus event");

  for (const kw of rules.volunteerTrigger.labelKeywords) {
    if (hay.includes(kw.toLowerCase())) {
      reasons.push(`Event type keyword: ${kw}`);
      break;
    }
  }

  const required = reasons.length > 0;
  const complete = rules.mobilizeCompleteStatuses.includes(stop.mobilizeStatus);
  const warning = required && !complete ? rules.warningLabel : null;

  return { required, warning, reasons: [...new Set(reasons)] };
}
