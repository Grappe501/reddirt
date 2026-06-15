/**
 * Cost per opportunity point — efficiency metric scaffold.
 *
 * effectiveScore / totalEffortUnits
 * Effort units = candidate hours + staff hours + travel weight (miles/100 + hotel nights)
 */

import type { CampaignAssignee } from "./candidate-routing";

export type EventCostEstimate = {
  eventId?: string;
  miles?: number;
  hotelNights?: number;
  candidateHours?: number;
  staffHours?: number;
};

export type CostEfficiencyRow = {
  eventId: string;
  title: string;
  county: string;
  campaignImpactScore: number;
  effectiveScore: number;
  effortUnits: number;
  costPerOpportunityPoint: number;
  assignment: CampaignAssignee;
  hasActualCosts: boolean;
};

const DEFAULT_EFFORT_BY_ASSIGNMENT: Record<CampaignAssignee, { candidateHours: number; staffHours: number; miles: number; hotelNights: number }> = {
  Kelly: { candidateHours: 4, staffHours: 6, miles: 120, hotelNights: 0.5 },
  Congressional: { candidateHours: 2, staffHours: 3, miles: 80, hotelNights: 0 },
  Senate: { candidateHours: 2.5, staffHours: 4, miles: 100, hotelNights: 0.25 },
  "County Team": { candidateHours: 0, staffHours: 3, miles: 40, hotelNights: 0 },
};

export function effortUnits(cost: EventCostEstimate, assignment: CampaignAssignee): number {
  const defaults = DEFAULT_EFFORT_BY_ASSIGNMENT[assignment];
  const candidateHours = cost.candidateHours ?? defaults.candidateHours;
  const staffHours = cost.staffHours ?? defaults.staffHours;
  const miles = cost.miles ?? defaults.miles;
  const hotelNights = cost.hotelNights ?? defaults.hotelNights;

  const travelWeight = miles / 100 + hotelNights * 2;
  return Math.max(1, Math.round((candidateHours + staffHours + travelWeight) * 10) / 10);
}

export function costPerOpportunityPoint(effectiveScore: number, units: number): number {
  if (units <= 0 || effectiveScore <= 0) return 0;
  return Math.round((effectiveScore / units) * 100) / 100;
}

export function hasActualCosts(cost: EventCostEstimate): boolean {
  return (
    cost.miles !== undefined ||
    cost.hotelNights !== undefined ||
    cost.candidateHours !== undefined ||
    cost.staffHours !== undefined
  );
}
