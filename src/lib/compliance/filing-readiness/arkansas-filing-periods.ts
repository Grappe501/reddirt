import type { FilingPeriod } from "./filing-readiness-types";

export const defaultArkansasFilingPeriods: FilingPeriod[] = [
  {
    id: "configurable-current-period",
    label: "Current filing period (configure before final use)",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    dueDate: undefined,
    sourceStatus: "needs_review",
    sourceNote:
      "Placeholder period. Verify against Arkansas Ethics reporting calendar for the exact race, election type, and filing period before relying on due dates.",
  },
];

export function getCurrentFilingPeriod(): FilingPeriod {
  return defaultArkansasFilingPeriods[0];
}
