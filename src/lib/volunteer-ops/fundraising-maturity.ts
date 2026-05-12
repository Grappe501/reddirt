import type { VosMaturityLevel } from "@/lib/volunteer-ops/vos-team-maturity";

/** Fundraising lane visibility vs Volunteer OS maturity (Week 4 / Level 4 alignment). */
export type FundraisingMaturityGate = "hidden" | "preview" | "recruit" | "operate";

export function fundraisingGateForMaturity(maturity: VosMaturityLevel): FundraisingMaturityGate {
  if (maturity <= 2) return "hidden";
  if (maturity === 3) return "preview";
  if (maturity === 4) return "recruit";
  return "operate";
}

export const FUNDRAISING_INTRO_COPY =
  "Fundraising is introduced after your team has basic operating rhythm. Start small, stay local, and make it fun." as const;
