import type { OpponentDiligenceLogFile } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

export type OpponentDiligenceSubjectId = OpponentDiligenceLogFile["subjectId"];

export type OpponentDiligenceSubject = {
  subjectId: OpponentDiligenceSubjectId;
  displayName: string;
  logRel: string;
  href: string;
  eyebrow: string;
  summary: string;
  fieldBookSlug: string;
};

export const OPPONENT_DILIGENCE_SUBJECTS: OpponentDiligenceSubject[] = [
  {
    subjectId: "kelly-grappe",
    displayName: "Kelly Grappe",
    logRel: "data/intelligence/kelly-court-diligence-log.json",
    href: "/admin/intelligence/diligence/kelly-grappe",
    eyebrow: "Candidate · defensive diligence",
    summary:
      "Five-search court/financial checklist before debate — log outcomes only, counsel gate on any hit.",
    fieldBookSlug: "kelly-five-search-checklist",
  },
  {
    subjectId: "kim-hammer",
    displayName: "Kim Hammer",
    logRel: "data/intelligence/kim-hammer-court-diligence-log.json",
    href: "/admin/intelligence/diligence/kim-hammer",
    eyebrow: "Opponent · offensive diligence",
    summary:
      "Mirror Kelly's five-search protocol on the incumbent — civil, criminal, UCC, business entity, property tax.",
    fieldBookSlug: "hammer-diligence-checklist",
  },
  {
    subjectId: "michael-packo",
    displayName: "Michael Pakko (Packo)",
    logRel: "data/intelligence/michael-packo-court-diligence-log.json",
    href: "/admin/intelligence/diligence/michael-packo",
    eyebrow: "Third candidate · contrast diligence",
    summary:
      "Five-search protocol plus PACKO-01/02 finance and quote gates — no attack lines until ledger partial.",
    fieldBookSlug: "pakko-diligence-checklist",
  },
];

export const OPPONENT_DILIGENCE_HUB_HREF = "/admin/intelligence/diligence";

export function getOpponentDiligenceSubject(subjectId: string): OpponentDiligenceSubject | undefined {
  return OPPONENT_DILIGENCE_SUBJECTS.find((s) => s.subjectId === subjectId);
}
