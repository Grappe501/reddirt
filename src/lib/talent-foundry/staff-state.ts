import {
  AREA_ASSIGNMENTS,
  CONFIRMED_PATHWAYS,
  INTERN_DECISIONS,
  INTERVIEW_STATUSES,
  type AreaAssignmentId,
  type ConfirmedPathway,
  type InternDecision,
  type InterviewStatus,
} from "./constants";

export type TalentFoundryStaffState = {
  humanRank: number | null;
  interviewStatus: InterviewStatus;
  interviewer: string;
  internDecision: InternDecision;
  pathway: ConfirmedPathway | null;
  areaAssignment: AreaAssignmentId[];
  reviewedAt: string | null;
};

export const EMPTY_STAFF_STATE: TalentFoundryStaffState = {
  humanRank: null,
  interviewStatus: "not_reviewed",
  interviewer: "",
  internDecision: "pending",
  pathway: null,
  areaAssignment: [],
  reviewedAt: null,
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function parseRank(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || n < 1 || n > 999) return null;
  return Math.floor(n);
}

export function parseStaffState(metadata: unknown): TalentFoundryStaffState {
  const meta = isRecord(metadata) ? metadata : {};
  const raw = isRecord(meta.talentFoundryStaff) ? meta.talentFoundryStaff : {};
  const interview = INTERVIEW_STATUSES.includes(raw.interviewStatus as InterviewStatus)
    ? (raw.interviewStatus as InterviewStatus)
    : "not_reviewed";
  const intern = INTERN_DECISIONS.includes(raw.internDecision as InternDecision)
    ? (raw.internDecision as InternDecision)
    : "pending";
  const pathway = CONFIRMED_PATHWAYS.includes(raw.pathway as ConfirmedPathway)
    ? (raw.pathway as ConfirmedPathway)
    : null;
  const areas = Array.isArray(raw.areaAssignment)
    ? raw.areaAssignment.filter((id): id is AreaAssignmentId =>
        AREA_ASSIGNMENTS.some((a) => a.id === id),
      )
    : [];
  return {
    humanRank: parseRank(raw.humanRank),
    interviewStatus: interview,
    interviewer: typeof raw.interviewer === "string" ? raw.interviewer.slice(0, 160) : "",
    internDecision: intern,
    pathway,
    areaAssignment: areas,
    reviewedAt: typeof raw.reviewedAt === "string" ? raw.reviewedAt : null,
  };
}

export function mergeStaffState(
  metadata: unknown,
  patch: Partial<TalentFoundryStaffState>,
): Record<string, unknown> {
  const meta = isRecord(metadata) ? { ...metadata } : {};
  const current = parseStaffState(meta);
  const next: TalentFoundryStaffState = {
    ...current,
    ...patch,
    areaAssignment: patch.areaAssignment ?? current.areaAssignment,
  };
  if (next.interviewStatus !== "not_reviewed" && !next.reviewedAt) {
    next.reviewedAt = new Date().toISOString();
  }
  meta.talentFoundryStaff = next;
  return meta;
}

export function isUnreviewed(staff: TalentFoundryStaffState): boolean {
  return staff.interviewStatus === "not_reviewed" && staff.reviewedAt == null && staff.humanRank == null;
}
